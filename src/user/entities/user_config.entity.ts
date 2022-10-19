import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users_config' })
export class UserConfig {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ nullable: true })
  goal: number;

  @Column({ nullable: true })
  time_reminder: string;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
