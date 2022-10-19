import { Exclude } from 'class-transformer';
import { UserHistory } from 'src/history/entities/history.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TestType } from '../test.constant';
import { Part } from './part.entity';

@Entity({ name: 'tests' })
export class Test {
  @PrimaryGeneratedColumn('increment')
  id?: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  folderId: string;

  @Column()
  description: string;

  @Column()
  type: TestType;

  @OneToMany(() => Part, (part) => part.test)
  parts?: Part[];

  @Column({ nullable: true })
  audioUrl?: string;

  @Column({ nullable: true })
  totalQuestions?: number;

  @Column({ nullable: true })
  duration?: number; //in seconds

  @OneToMany(() => UserHistory, (history) => history.test)
  history?: UserHistory[];

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
