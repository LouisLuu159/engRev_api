import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNotEmpty,
  IsOptional,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'testId' })
@Injectable()
class AnswerSheetValidation implements ValidatorConstraintInterface {
  validate(value: object, args: ValidationArguments): boolean {
    Object.keys(value).forEach((key) => {
      const options = ['A', 'B', 'C', 'D'];
      const questionNo = Number(key);
      const check = Boolean(Number(key)) && options.includes(value[key]);
      if (!check) return false;
      if (!(questionNo >= 1 && questionNo <= 200)) return false;
    });
    return true;
  }
  defaultMessage(args: ValidationArguments) {
    return `answer_sheet is not valid`;
  }
}

export class SubmitTestDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  testId: string;

  @ApiProperty({
    type: 'object',
    required: true,
  })
  @Validate(AnswerSheetValidation)
  answer_sheet: object;
}
