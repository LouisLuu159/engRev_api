import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsString,
  Length,
  IsIn,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';

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

export class EmailDto {
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
}

export class VerifyCodeDto extends PickType(EmailDto, ['email'] as const) {
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

export class ForgotPasswordDto extends PickType(EmailDto, ['email'] as const) {}

export class ResetPasswordDto extends PickType(LoginDto, [
  'password',
] as const) {}

export enum Verification_Types {
  RESET_PASSWORD = 'RESET_PASSWORD',
  ACTIVATE = 'ACTIVATE',
}

const RESEND_TYPES = {
  RESET_PASSWORD: Verification_Types.RESET_PASSWORD,
  ACTIVATE: Verification_Types.ACTIVATE,
};

export class ResendEmailDto extends PickType(EmailDto, ['email'] as const) {
  //Type
  @ApiProperty({
    example: 'RESET_PASSWORD',
    description: 'The password of the User',
    format: 'string',
    minLength: 6,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(RESEND_TYPES))
  readonly type: string;
}

@ValidatorConstraint({ name: 'username' })
@Injectable()
class CustomUsernameValidation implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const usernameRegex = /^(\w|\.){5,40}$/g;
    return usernameRegex.test(value);
  }
  defaultMessage(args: ValidationArguments) {
    return `username must contain only: number, alphabet, hyphens(_)`;
  }
}

export class UsernameDto {
  // Username
  @ApiProperty({
    example: 'Louis_Luu123',
    description: 'Username',
    format: 'string',
    minLength: 5,
    maxLength: 255,
    required: true,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(40)
  @Validate(CustomUsernameValidation)
  username: string;
}
