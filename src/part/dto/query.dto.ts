import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetPartQueryDto {
  @ApiProperty({
    type: 'boolean',
    required: false,
  })
  transcriptInclude?: boolean;

  @ApiProperty({
    type: 'boolean',
    required: false,
  })
  answerInclude?: boolean;

  @ApiProperty({
    type: 'boolean',
    required: false,
  })
  questionInclude?: boolean;
}
