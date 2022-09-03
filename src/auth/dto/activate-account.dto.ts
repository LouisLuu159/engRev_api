import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateAccountDto {
  // Email
  @ApiProperty({
    example: 'louis123@gmail.com',
    description: 'The email of the User',
    format: 'email',
    uniqueItems: true,
    minLength: 5,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(350)
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
