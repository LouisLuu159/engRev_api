import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NoteType, WordType } from '../note.constant';

@Entity({ name: 'notes' })
export class Notes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  noteType: NoteType;

  @Column({ nullable: false, length: 300 })
  wordKey: string;

  @Column({ nullable: true, length: 4000 })
  text?: string;

  @Column({ nullable: true, length: 500 })
  description?: string;

  @Column({ nullable: true })
  wordType?: WordType;

  @Column({ nullable: true, length: 400 })
  en_meaning?: string;

  @Column({ nullable: true, length: 600 })
  vi_meaning?: string;

  @Column({ nullable: true, length: 400 })
  en_example?: string;

  @Column({ nullable: true, length: 600 })
  vi_example?: string;

  @Column({ nullable: true, length: 400 })
  imageURl?: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true, length: 500 })
  tags?: string;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
