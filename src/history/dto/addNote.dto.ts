import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PartType } from 'src/eng_test/test.constant';
import { CreateNoteDto } from 'src/note/dto/create-note.dto';

export class AddHistoryNoteDto {
  @ApiProperty({
    type: 'number',
    example: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  questionNo?: number;

  @ApiProperty({
    type: 'number',
    example: '147-148',
  })
  @IsOptional()
  @MaxLength(10)
  questionRange?: string;

  @ApiProperty({
    type: 'string',
    enum: Object.values(PartType),
    required: true,
  })
  @IsNotEmpty()
  @IsIn(Object.values(PartType))
  part: PartType;

  @ValidateNested()
  @Type(() => CreateNoteDto)
  note: CreateNoteDto;
}
