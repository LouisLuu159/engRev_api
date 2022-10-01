import { Exclude } from 'class-transformer';
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

  @Column()
  folderId?: string;

  @Column()
  description: string;

  @Column()
  type: TestType;

  @OneToMany(() => Part, (part) => part.test)
  parts?: Part;

  @Column()
  audioUrl?: string;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
