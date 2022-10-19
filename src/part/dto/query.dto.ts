import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class GetPartQueryDto {
  @ApiProperty({
    type: 'boolean',
    required: false,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  transcriptInclude?: boolean;

  @ApiProperty({
    type: 'boolean',
    required: false,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  answerInclude?: boolean;

  @ApiProperty({
    type: 'boolean',
    required: false,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  questionInclude?: boolean;
}
