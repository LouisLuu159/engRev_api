import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRT } from './user_rt.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ length: 255 })
  full_name: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  age?: number;

  @Column({ unique: true, length: 350 })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @OneToMany(() => UserRT, (user_rt) => user_rt.user)
  user_rts?: UserRT;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
