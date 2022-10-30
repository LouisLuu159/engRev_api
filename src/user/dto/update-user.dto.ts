import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsNumber,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Louis Luu',
    description: 'The name of the User',
    format: 'string',
    minLength: 5,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  full_name?: string;

  @ApiProperty({
    example: 19,
    description: 'Age of the User',
    format: 'number',
    minimum: 1,
    maximum: 200,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(255)
  age?: number;
}

@ValidatorConstraint({ name: 'time_reminder' })
@Injectable()
class TimeReminderValidation implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const times = value.split(':');
    if (times.length != 2) return false;
    const hour = Number(times[0]);
    const minute = Number(times[1]);
    const checkHour = hour <= 23 && hour >= 0;
    const checkMinute = minute <= 59 && minute >= 0;
    return checkHour && checkMinute;
  }
  defaultMessage(args: ValidationArguments) {
    return `time_reminder is not valid`;
  }
}

export class UpdateConfigDto {
  @ApiProperty({
    example: 750,
    description: `Expected goal of user`,
    format: 'number',
    minimum: 200,
    maximum: 990,
  })
  @IsOptional()
  @IsNumber()
  @Min(200)
  @Max(990)
  goal?: number;

  @ApiProperty({
    example: '20:80',
    description: `Time reminder`,
    format: 'string',
    minLength: 5,
    maxLength: 5,
  })
  @IsOptional()
  @IsString()
  @Validate(TimeReminderValidation)
  time_reminder?: string;
}
