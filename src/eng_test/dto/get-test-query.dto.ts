import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
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
