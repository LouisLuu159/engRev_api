import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PartType, Skills, TestType } from '../test.constant';
import { Collection } from './collection.entity';
import { Test } from './test.entity';

@Entity({ name: 'parts' })
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

  @Column()
  testId?: string;

  @OneToMany(() => Collection, (collection) => collection.part)
  collections?: Collection[];

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
