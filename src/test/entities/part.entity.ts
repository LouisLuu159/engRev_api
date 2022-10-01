import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PartType, Skills, TestType } from '../test.constant';
import { Test } from './test.entity';

@Entity({ name: 'user_rts' })
export class Part {
  @PrimaryGeneratedColumn('increment')
  id?: string;

  @Column()
  type: PartType;

  @Column({ type: 'int' })
  range_start: number;

  @Column({ type: 'int' })
  range_end: number;

  @Column()
  skill: Skills;

  @ManyToOne(() => Test, (test) => test.parts, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  test?: Test;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
