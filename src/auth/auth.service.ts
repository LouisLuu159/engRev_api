import {
  BadRequestException,
  CACHE_MANAGER,
  Controller,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ResponseErrors } from 'src/common/constants/ResponseErrors';
import { hashString } from 'src/common/utils/authHelper';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { TokenPayload } from './interfaces/TokenPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BaseConfigKey } from 'src/common/config/baseConfig';
import { LoginSignUpResponse } from './dto/login-signup-response';

interface InactivatedUser {
  email: string;
  otp: string;
  password: string;
  full_name: string;
}
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const checkEmailExist = await this.userService.getUserByEmail(
      createUserDto.email,
    );

    if (checkEmailExist)
      throw new BadRequestException(ResponseErrors.VALIDATION.EMAIL_EXIST);

    const email = createUserDto.email;
    const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
    const hashedPassword = await hashString(createUserDto.password);
    const value: InactivatedUser = {
      email: email,
      otp: otp,
      password: hashedPassword,
      full_name: createUserDto.full_name,
    };
    await this.cacheManager.set(email, value, { ttl: 1 * 3600 });
    await this.mailService.sendAccountVerificationMail(email, otp);
    return { email: email, full_name: createUserDto.full_name };
  }

  async verifyActivatingCode(email: string, otp: string): Promise<User> {
    const value: InactivatedUser = await this.cacheManager.get(email);
    if (value && value.otp == otp) {
      await this.cacheManager.del(email);
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
      loginDto.email,
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
}
