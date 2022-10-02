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
import { Part } from './part.entity';

@Entity({ name: 'collections' })
export class Collection {
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

  @ManyToOne(() => Part, (part) => part.collections, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  part?: Part;

  @Column()
  partId?: string;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
