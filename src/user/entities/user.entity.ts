import { Exclude } from 'class-transformer';
import { UserHistory } from 'src/history/entities/history.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserConfig } from './user_config.entity';
import { UserRT } from './user_rt.entity';
import { UserStatus } from './user_status.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ length: 255, nullable: true })
  full_name?: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  age?: number;

  @Column({ unique: true, length: 350 })
  email: string;

  @Column({ unique: true, length: 128 })
  username: string;

  @Column({ length: 256 })
  @Exclude({ toPlainOnly: true })
  password: string;

  @OneToMany(() => UserRT, (user_rt) => user_rt.user)
  user_rts?: UserRT[];

  @OneToOne(() => UserStatus)
  @JoinColumn()
  status?: UserStatus;

  @OneToOne(() => UserConfig)
  @JoinColumn()
  config?: UserConfig;

  @OneToMany(() => UserHistory, (history) => history.user)
  history?: UserHistory[];

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
