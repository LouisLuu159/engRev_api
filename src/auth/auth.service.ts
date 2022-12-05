import {
  BadRequestException,
  CACHE_MANAGER,
  Controller,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ResponseErrors } from 'src/common/constants/ResponseErrors';
import { compareHash, hashString } from 'src/common/utils/authHelper';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

import { Request } from 'express';
import { TokenPayload } from './interfaces/TokenPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BaseConfigKey } from 'src/common/config/baseConfig';
import {
  LoginSignUpResponse,
  ResetPasswordResponseDto,
} from './dto/response.dto';
import { NotFoundError } from 'rxjs';
import {
  LoginDto,
  ResendEmailDto,
  ResetPasswordDto,
  Verification_Types,
  VerifyCodeDto,
} from './dto/request.dto';
import { ForgotPasswordResponseDto } from './dto/response.dto';

interface ActivatingUser {
  email: string;
  password: string;
  full_name: string;
  username: string;
}
interface VerificationValue {
  otp: string;
  activatingUser?: ActivatingUser;
  type: Verification_Types;
}

const resetToken = 'reset@@eng_rev123';
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private createOtp(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  async signUp(createUserDto: CreateUserDto) {
    const checkEmailExist = await this.checkEmailExist(createUserDto.email);
    const checkUsernameExist = await this.checkUsernameExist(
      createUserDto.username,
    );

    const errorMessages = [];
    if (checkEmailExist)
      errorMessages.push(ResponseErrors.VALIDATION.EMAIL_EXIST);
    if (checkUsernameExist)
      errorMessages.push(ResponseErrors.VALIDATION.USERNAME_EXIST);
    if (errorMessages.length > 0)
      throw new UnprocessableEntityException(errorMessages);

    const email = createUserDto.email;
    const otp = this.createOtp();
    const hashedPassword = await hashString(createUserDto.password);
    const activatingUser: ActivatingUser = {
      email: email,
      password: hashedPassword,
      username: createUserDto.username,
      full_name: createUserDto?.full_name || null,
    };
    const value: VerificationValue = {
      otp: otp,
      activatingUser: activatingUser,
      type: Verification_Types.ACTIVATE,
    };

    await this.cacheManager.set(email, value, { ttl: 1 * 3600 });
    await this.cacheManager.set(value.activatingUser.username, true, {
      ttl: 1 * 3600,
    });
    await this.mailService.sendAccountVerificationMail(email, otp);

    const response = {
      email: email,
      full_name: createUserDto.full_name,
      username: createUserDto.username,
    };
    return response;
  }

  async verifyActivatingCode(email: string, otp: string): Promise<User> {
    const value: VerificationValue = await this.cacheManager.get(email);
    if (
      value &&
      value.otp == otp &&
      value.type == Verification_Types.ACTIVATE
    ) {
      await this.cacheManager.del(email);
      await this.cacheManager.del(value.activatingUser.username);
      const new_user = await this.userService.create(value.activatingUser);
      return new_user;
    } else
      throw new BadRequestException(ResponseErrors.VALIDATION.OTP_NOT_CORRECT);
  }

  private getJwtRefreshToken(id: string, email: string): string {
    const payload: TokenPayload = { id, email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get(BaseConfigKey.REFRESH_TOKEN_SECRET),
      expiresIn: this.configService.get(BaseConfigKey.REFRESH_TOKEN_EXPIRE),
    });
    return token;
  }

  private getJwtAccessToken(id: string, email: string): string {
    const payload: TokenPayload = { id, email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get(BaseConfigKey.ACCESS_TOKEN_SECRET),
      expiresIn: this.configService.get(BaseConfigKey.ACCESS_TOKEN_EXPIRE),
    });
    return token;
  }

  private getExpirationTime = (expiredIn: string): number => {
    expiredIn = expiredIn.trim();

    const timeUnit = expiredIn.charAt(expiredIn.length - 1);
    const timeNumber = Number(expiredIn.substring(0, expiredIn.length - 1));

    let expTime = timeNumber * 1000;
    if (timeUnit == 'm') expTime *= 60;
    if (timeUnit == 'h') expTime *= 60 * 60;
    if (timeUnit == 'd') expTime *= 60 * 60 * 24;
    return expTime;
  };

  async checkLogin(request: Request, loginDto: LoginDto) {
    const user = await this.userService.checkCredential(
      loginDto.login,
      loginDto.password,
    );
    if (user === undefined)
      throw new UnauthorizedException(ResponseErrors.UNAUTHORIZED.LOGIN_FAIL);

    const accessToken = this.getJwtAccessToken(user.id, user.email);
    const refreshToken = this.getJwtRefreshToken(user.id, user.email);

    const new_userRT = await this.userService.addRefreshToken(
      user.id,
      refreshToken,
    );

    request.res.cookie('Authentication', accessToken, {
      httpOnly: true,
      maxAge: this.getExpirationTime(
        this.configService.get(BaseConfigKey.ACCESS_TOKEN_EXPIRE),
      ),
    });

    request.res.cookie('Refresh', refreshToken, {
      httpOnly: true,
      maxAge: this.getExpirationTime(
        this.configService.get(BaseConfigKey.REFRESH_TOKEN_EXPIRE),
      ),
    });

    const response = new LoginSignUpResponse();
    response.data = {
      email: user.email,
      id: user.id,
      full_name: user.full_name,
      username: user.username,
    };
    response.authToken = accessToken;
    return response;
  }

  async renewAccessToken(request: Request, refreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get(BaseConfigKey.REFRESH_TOKEN_SECRET),
      });
      const userId = payload.id;
      const checkExists = await this.userService.checkRefreshTokenExists(
        userId,
        refreshToken,
      );
      if (!checkExists) throw new Error();

      const new_at = this.getJwtAccessToken(userId, payload.email);

      request.res.cookie('Authentication', new_at, {
        httpOnly: true,
        maxAge: this.getExpirationTime(
          this.configService.get(BaseConfigKey.ACCESS_TOKEN_EXPIRE),
        ),
      });

      return { authToken: new_at };
    } catch (error) {
      request.res.cookie('Refresh', '', {
        httpOnly: true,
        maxAge: 0,
      });
      throw new UnauthorizedException(
        ResponseErrors.UNAUTHORIZED.EXPIRED_TOKEN,
      );
    }
  }

  async handleForgotPassword(email: string): Promise<void> {
    const checkEmailExist = await this.userService.getUserByEmail(email);

    if (checkEmailExist) {
      const otp = this.createOtp();
      const value: VerificationValue = {
        otp: otp,
        type: Verification_Types.RESET_PASSWORD,
      };
      await this.cacheManager.set(email, value, { ttl: 1 * 3600 });
      await this.mailService.sendResetPasswordMail(email, otp);
    } else
      throw new BadRequestException(ResponseErrors.VALIDATION.EMAIL_NOT_EXIST);
  }

  async verifyForgotPasswordCode(
    request: Request,
    verifyCodeDto: VerifyCodeDto,
  ): Promise<ForgotPasswordResponseDto> {
    const { email, otp } = verifyCodeDto;
    const value: VerificationValue = await this.cacheManager.get(email);
    if (
      value &&
      value.otp == otp &&
      value.type == Verification_Types.RESET_PASSWORD
    ) {
      await this.cacheManager.del(email);
      const payload = { email: email };
      const token = this.jwtService.sign(payload, {
        secret: resetToken,
        expiresIn: '15m',
      });

      request.res.cookie('Authentication', token, {
        httpOnly: true,
        maxAge: this.getExpirationTime('15m'),
      });

      const response: ForgotPasswordResponseDto = {
        data: { email: email },
        message: 'Verification code is valid',
      };
      return response;
    } else
      throw new BadRequestException(ResponseErrors.VALIDATION.OTP_NOT_CORRECT);
  }

  async handleResetPassword(
    request: any,
    body: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    const token = request?.cookies?.Authentication;
    let payload;
    try {
      if (token == undefined) throw new Error();
      payload = this.jwtService.verify(token, {
        secret: resetToken,
      });
    } catch (error) {
      throw new UnauthorizedException(
        ResponseErrors.UNAUTHORIZED.EXPIRED_TOKEN,
      );
    }
    const email = payload.email;
    const updated_user = await this.userService.resetPassword(
      email,
      body.password,
    );
    const response: ResetPasswordResponseDto = {
      data: { email: email, id: updated_user.id },
      message: 'Password is reset',
    };
    return response;
  }

  async resendEmail(body: ResendEmailDto) {
    const value: VerificationValue = await this.cacheManager.get(body.email);
    const otp = this.createOtp();

    if (body.type == Verification_Types.ACTIVATE) {
      if (value && value.type == body.type) {
        await this.cacheManager.del(body.email);
        const new_value = { ...value, otp: otp };

        await this.cacheManager.set(body.email, new_value, { ttl: 1 * 3600 });
        await this.cacheManager.set(new_value.activatingUser.username, true, {
          ttl: 1 * 3600,
        });
        await this.mailService.sendAccountVerificationMail(body.email, otp);
      } else
        throw new UnprocessableEntityException(
          ResponseErrors.VALIDATION.EMAIL_NOT_EXIST,
        );
    } else {
      await this.cacheManager.del(body.email);
      const new_value: VerificationValue = {
        otp: otp,
        type: Verification_Types.RESET_PASSWORD,
      };
      await this.cacheManager.set(body.email, new_value, { ttl: 1 * 3600 });
    }
  }

  async checkEmailExist(email: string) {
    const checkEmailExistInDb = await this.userService.getUserByEmail(email);
    const checkEmailInCache = await this.cacheManager.get(email);
    return Boolean(checkEmailExistInDb) || Boolean(checkEmailInCache);
  }

  async checkUsernameExist(username: string) {
    const checkUsernameExistInDb = await this.userService.getUserByUsername(
      username,
    );
    const checkUsernameInCache = await this.cacheManager.get(username);
    return Boolean(checkUsernameExistInDb) || Boolean(checkUsernameInCache);
  }

  async checkAdminPermission(
    username: string,
    password: string,
    request: Request,
  ) {
    const valid = await compareHash(
      password,
      this.configService.get(BaseConfigKey.ADMIN_SECRETE),
    );
    const validCredential =
      username == this.configService.get(BaseConfigKey.ADMIN_KEY) && valid;

    if (!validCredential) throw new ForbiddenException('No right to access');

    const payload = { id: 'admin', email: username, role: 'admin' };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get(BaseConfigKey.ACCESS_TOKEN_SECRET),
      expiresIn: '3h',
    });

    request.res.cookie('Authentication', token, {
      httpOnly: true,
      maxAge: this.getExpirationTime('3h'),
    });

    return true;
  }
}
