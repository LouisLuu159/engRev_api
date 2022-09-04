import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_rts' })
export class UserRT {
  @PrimaryGeneratedColumn('increment')
  id?: string;

  @Column()
  userId?: string;

  @ManyToOne(() => User, (user) => user.user_rts, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  user?: User;

  @Column({ unique: true, length: 350 })
  rt: string;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
