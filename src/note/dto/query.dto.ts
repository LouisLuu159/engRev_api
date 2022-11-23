import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class GetNoteQueryDto {
  @ApiProperty({
    example: 'develop',
    type: 'string',
  })
  @IsOptional()
  @MaxLength(300)
  wordKey: string;
}
