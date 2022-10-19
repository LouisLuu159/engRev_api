import {
  IsNotEmpty,
  IsIn,
  IsOptional,
  MaxLength,
  IsNumber,
  IsNumberString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartType, Skills, TestType } from '../test.constant';
import { Transform } from 'class-transformer';

export class UploadTestBodyDto {
  @ApiProperty({
    example: TestType.FULL_TEST,
    type: 'string',
    enum: Object.values(TestType),
    required: true,
  })
  @IsNotEmpty()
  @IsIn(Object.values(TestType))
  testType: TestType;

  @ApiProperty({
    example: 'Test 1',
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '7200',
    type: 'number',
    required: true,
  })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  duration: number;

  @ApiProperty({
    example: 'Description',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    type: 'string',
    enum: Object.values(Skills),
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(Skills))
  skillType?: Skills;

  @ApiProperty({
    type: 'string',
    enum: Object.values(PartType),
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(PartType))
  partType?: PartType;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(256)
  folderId: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @MaxLength(500)
  audioUrl?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
  })
  questionFile?: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
  })
  answerKeyFile: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
  })
  transcriptFile?: Express.Multer.File;
}

export class UploadTestQueryDto {
  @ApiProperty({
    example: TestType.FULL_TEST,
    type: 'string',
    enum: Object.values(TestType),
    required: true,
  })
  @IsNotEmpty()
  @IsIn(Object.values(TestType))
  testType: string;

  @ApiProperty({
    type: 'string',
    enum: Object.values(Skills),
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(Skills))
  skillType?: string;

  @ApiProperty({
    type: 'string',
    enum: Object.values(PartType),
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(PartType))
  partType?: string;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(256)
  folderId: string;
}
