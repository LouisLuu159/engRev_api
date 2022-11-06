import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PartType, Skills, TestType } from '../test.constant';

export class GetTestQueryDto {
  @ApiProperty({
    type: 'string',
    enum: Object.values(Skills),
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(Skills))
  skill?: Skills;

  @ApiProperty({
    type: 'string',
    enum: Object.values(PartType),
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(PartType))
  partType?: PartType;

  @ApiProperty({
    example: TestType.FULL_TEST,
    type: 'string',
    enum: Object.values(TestType),
    required: true,
  })
  @IsOptional()
  @IsIn(Object.values(TestType))
  testType?: TestType;
}

export class GetTranscriptQueryDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  partId?: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  collectionId?: string;
}
