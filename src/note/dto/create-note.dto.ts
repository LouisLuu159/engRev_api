import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { NoteType, WordType } from '../note.constant';

export class CreateNoteDto {
  @ApiProperty({
    example: NoteType.VOCABULARY,
    type: 'string',
    enum: Object.values(NoteType),
    required: true,
  })
  @IsNotEmpty()
  @IsIn(Object.values(NoteType))
  noteType: NoteType;

  @ApiProperty({
    example: 'develop',
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(300)
  wordKey: string;

  @ApiProperty({
    description: 'Note text (in case OTHERS type)',
    type: 'string',
  })
  @IsOptional()
  @MaxLength(4000)
  text?: string;

  @ApiProperty({
    description: 'Note description',
    type: 'string',
  })
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: WordType.NOUN,
    enum: Object.values(WordType),
    type: 'string',
  })
  @IsOptional()
  @IsIn(Object.values(WordType))
  wordType?: WordType;

  @ApiProperty({
    description: 'English meaning',
    type: 'string',
  })
  @IsOptional()
  @MaxLength(400)
  en_meaning?: string;

  @ApiProperty({
    description: 'Vietnamese meaning',
    type: 'string',
  })
  @IsOptional()
  @MaxLength(600)
  vi_meaning?: string;

  @ApiProperty({
    description: 'English example',
    type: 'string',
  })
  @IsOptional()
  @MaxLength(400)
  en_example?: string;

  @ApiProperty({
    description: 'Vietnamese-translated English example',
    type: 'string',
  })
  @IsOptional()
  @MaxLength(600)
  vi_example?: string;

  @ApiProperty({
    description: 'Note image URL',
    type: 'string',
  })
  @IsOptional()
  @MaxLength(400)
  imageURl?: string;

  @ApiProperty({
    description: 'Note color',
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(50)
  color: string;

  @ApiProperty({
    description: 'Note tags',
    type: 'string',
    required: true,
  })
  @IsOptional()
  @MaxLength(500)
  tags?: string;
}
