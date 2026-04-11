import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  refreshTokenHash: string;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
