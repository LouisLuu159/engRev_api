import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsString,
  IsEmpty,
  IsOptional,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'password' })
@Injectable()
class CustomPasswordValidation implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,50}$/g;
    return passwordRegex.test(value);
  }
  defaultMessage(args: ValidationArguments) {
    return `password must include : at least 1 UPPERCASE (A-Z), 1 lowercase (a-z), 1 number (0-9), 1 special character(!@#$%^&*)`;
  }
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

export class CreateUserDto {
  // name
  @ApiProperty({
    example: 'Louis Luu',
    description: 'The name of the User',
    format: 'string',
    minLength: 5,
    maxLength: 255,
    required: true,
  })
  @IsOptional()
  @MinLength(5)
  @MaxLength(250)
  full_name?: string;

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

  // Email
  @ApiProperty({
    example: 'louis123@gmail.com',
    description: `User's email`,
    format: 'email',
    uniqueItems: true,
    minLength: 5,
    maxLength: 350,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(320)
  @IsEmail()
  email: string;

  // Password
  @ApiProperty({
    example: 'louis789',
    description: `User's password`,
    format: 'string',
    minLength: 6,
    maxLength: 50,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Validate(CustomPasswordValidation)
  password: string;
}
