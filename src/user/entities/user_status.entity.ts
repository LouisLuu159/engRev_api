import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users_status' })
export class UserStatus {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ nullable: true })
  full_score: number;

  @Column({ nullable: true })
  listening_score: number;

  @Column({ nullable: true })
  reading_score: number;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
