import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { School } from './school.entity';

export type UserRole = 'PARENT' | 'CLASS_TEACHER' | 'SUBJECT_TEACHER' | 'SCHOOL_ADMIN' | 'ACADEMIC_COORD' | 'SUPER_ADMIN';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string | null;

  @Column({ nullable: true, unique: true })
  mobileE164: string | null;

  @Column({ type: 'varchar', default: 'PARENT' })
  role: UserRole;

  @Column()
  schoolId: string;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  ssoProvider: string | null;

  @Column({ nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
