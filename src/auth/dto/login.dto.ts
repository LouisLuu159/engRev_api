import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
  readonly email: string;

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
