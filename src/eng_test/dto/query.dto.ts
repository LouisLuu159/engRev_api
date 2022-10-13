import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Skills } from '../test.constant';

export class GetTestQueryDto {
  @ApiProperty({
    type: 'string',
    enum: Object.values(Skills),
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(Skills))
  skill?: Skills;
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
