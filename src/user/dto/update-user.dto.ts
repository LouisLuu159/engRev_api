import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Louis Luu',
    description: 'The name of the User',
    format: 'string',
    minLength: 5,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  full_name: string;

  @ApiProperty({
    example: 19,
    description: 'Age of the User',
    format: 'number',
    minimum: 1,
    maximum: 200,
  })
  @IsInt()
  @Min(1)
  @Max(255)
  age: number;
}
