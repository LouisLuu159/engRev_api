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
import { HistoryDetail } from './historyDetail.entity';
import { PartType } from 'src/eng_test/test.constant';
import { Notes } from 'src/note/entities/note.entity';
import { UserHistory } from './history.entity';

@Entity({ name: 'history_note' })
export class HistoryNote {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ nullable: true })
  questionNo?: number;

  @Column({ nullable: true })
  questionRange?: string;

  @Column()
  part: PartType;

  @OneToOne(() => Notes)
  @JoinColumn()
  note: Notes;

  @Column()
  noteId: string;

  @ManyToOne(() => UserHistory, (history) => history.historyNote, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  history?: UserHistory;

  @Column()
  historyId: string;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
