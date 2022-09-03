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
  ) {}

  async signUp(createUserDto: CreateUserDto) {
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

  async verifyCode(email: string, otp: string): Promise<User> {
    const value: InactivatedUser = await this.cacheManager.get(email);
    if (value && value.otp == otp) {
      await this.cacheManager.del(email);
      const { otp, ...createUserDto } = value;
      const new_user = await this.userService.create(createUserDto);
      return new_user;
    } else
      throw new BadRequestException(ResponseErrors.VALIDATION.OTP_NOT_CORRECT);
  }
}
