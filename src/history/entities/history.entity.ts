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

@Entity({ name: 'users_history' })
export class UserHistory {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ nullable: true })
  score: number;

  @ManyToOne(() => User, (user) => user.history, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  user?: User;

  @Column()
  userId: string;

  @ManyToOne(() => Test, (test) => test.history, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  test?: Test;

  @Column()
  testId: string;

  @OneToOne(() => HistoryDetail)
  @JoinColumn()
  detail?: HistoryDetail;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
