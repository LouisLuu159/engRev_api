import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestionDictionary } from '../interfaces/question.interface';
import { TranscriptDictionary } from '../interfaces/transcript.interface';
import {
  PartRangeEnd,
  PartRangeStart,
  PartType,
  Skills,
  TestType,
} from '../test.constant';
import { Test } from './test.entity';

@Entity({ name: 'user_rts' })
export class Part {
  @PrimaryGeneratedColumn('increment')
  id?: string;

  @Column({ type: 'int' })
  range_start: number;

  @Column({ type: 'int' })
  range_end: number;

  @Column({ type: 'json' })
  images: string[];

  @Column({ type: 'json' })
  transcript: TranscriptDictionary | string;

  @Column({ type: 'json' })
  questions: QuestionDictionary;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
