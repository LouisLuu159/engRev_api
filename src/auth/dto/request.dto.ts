import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';

export class LoginDto {
  // Email
  @ApiProperty({
    example: 'louis123@gmail.com',
    description: 'The email or username',
    uniqueItems: true,
    maxLength: 320,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(320)
  readonly login: string;

  // Password
  @ApiProperty({
    example: 'louis789',
    description: 'The password of the User',
    format: 'string',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  readonly password: string;
}

export class VerifyCodeDto {
  // Email
  @ApiProperty({
    example: 'louis123@gmail.com',
    description: 'The email of the User',
    format: 'email',
    uniqueItems: true,
    minLength: 5,
    maxLength: 320,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(320)
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345678',
    description: 'The verification code',
    format: 'string',
    uniqueItems: true,
    minLength: 8,
    maxLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @Length(8)
  otp: string;
}

export class ForgotPasswordDto {
  // Email
  @ApiProperty({
    example: 'louis123@gmail.com',
    description: 'The email of the User',
    format: 'email',
    uniqueItems: true,
    minLength: 5,
    maxLength: 320,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(320)
  @IsEmail()
  readonly email: string;
}

export class ResetPasswordDto {
  // Password
  @ApiProperty({
    example: 'louis789',
    description: 'The password of the User',
    format: 'string',
    minLength: 6,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  readonly password: string;
}
