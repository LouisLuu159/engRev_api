import {
  BadRequestException,
  CACHE_MANAGER,
  Controller,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ResponseErrors } from 'src/common/constants/ResponseErrors';
import { hashString } from 'src/common/utils/authHelper';
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
import { LoginDto, ResetPasswordDto, VerifyCodeDto } from './dto/request.dto';
import { ForgotPasswordResponseDto } from './dto/response.dto';

interface InactivatedUser {
  email: string;
  otp: string;
  password: string;
  full_name: string;
  username: string;
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
    const checkEmailExistInDb = await this.userService.getUserByEmail(
      createUserDto.email,
    );
    const checkUsernameExistInDb = await this.userService.getUserByUsername(
      createUserDto.username,
    );

    const checkEmailExist =
      checkEmailExistInDb || (await this.cacheManager.get(createUserDto.email));

    const checkUsernameExist =
      checkUsernameExistInDb ||
      (await this.cacheManager.get(createUserDto.username));

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
    const value: InactivatedUser = {
      email: email,
      otp: otp,
      password: hashedPassword,
      username: createUserDto.username,
      full_name: createUserDto?.full_name || null,
    };
    await this.cacheManager.set(email, value, { ttl: 1 * 3600 });
    await this.cacheManager.set(value.username, true, {
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
    const value: InactivatedUser = await this.cacheManager.get(email);
    if (value && value.otp == otp) {
      await this.cacheManager.del(email);
      await this.cacheManager.del(value.username);
      const { otp, ...createUserDto } = value;
      const new_user = await this.userService.create(createUserDto);
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
      sameSite: 'none',
    });

    request.res.cookie('Refresh', refreshToken, {
      httpOnly: true,
      maxAge: this.getExpirationTime(
        this.configService.get(BaseConfigKey.REFRESH_TOKEN_EXPIRE),
      ),
      sameSite: 'none',
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
        sameSite: 'none',
      });

      return { authToken: new_at };
    } catch (error) {
      throw new UnauthorizedException(
        ResponseErrors.UNAUTHORIZED.EXPIRED_TOKEN,
      );
    }
  }

  async handleForgotPassword(email: string): Promise<void> {
    const checkEmailExist = await this.userService.getUserByEmail(email);

    if (checkEmailExist) {
      const otp = this.createOtp();
      await this.cacheManager.set(email, otp, { ttl: 1 * 3600 });
      await this.mailService.sendResetPasswordMail(email, otp);
    } else throw new NotFoundException(ResponseErrors.NOT_FOUND);
  }

  async verifyForgotPasswordCode(
    request: Request,
    verifyCodeDto: VerifyCodeDto,
  ): Promise<ForgotPasswordResponseDto> {
    const { email, otp } = verifyCodeDto;
    const value = await this.cacheManager.get(email);
    if (value !== otp)
      throw new BadRequestException(ResponseErrors.VALIDATION.OTP_NOT_CORRECT);

    await this.cacheManager.del(email);
    const payload = { email: email };
    const token = this.jwtService.sign(payload, {
      secret: resetToken,
      expiresIn: '15m',
    });

    request.res.cookie('Authentication', token, {
      httpOnly: true,
      maxAge: this.getExpirationTime('15m'),
      sameSite: 'none',
    });

    const response: ForgotPasswordResponseDto = {
      data: { email: email },
      message: 'Verification code is valid',
    };
    return response;
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
}
