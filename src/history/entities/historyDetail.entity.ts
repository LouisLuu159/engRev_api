import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Test } from 'src/eng_test/entities/test.entity';
import { AnswerSheetHistory, PartScores } from '../interface/history.interface';

@Entity({ name: 'history_detail' })
export class HistoryDetail {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'json' })
  answer_sheet: AnswerSheetHistory;

  @Column({ type: 'json' })
  partScores: PartScores;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
