import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Guardian } from './guardian.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  schoolId: string;

  @Column({ type: 'varchar', unique: true })
  studentCode: string; // auto-generated: "2025-6A-001"

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({ type: 'varchar', default: 'M' })
  gender: 'M' | 'F' | 'Other';

  @Column({ type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'uuid' })
  gradeId: string;

  @Column({ type: 'uuid' })
  sectionId: string;

  @Column({ type: 'int', default: 0 })
  rollNumber: number;

  @Column({ type: 'date', nullable: true })
  admissionDate: string | null;

  @Column({ type: 'varchar', default: 'active' })
  status: 'active' | 'transferred' | 'withdrawn';

  @Column({ type: 'boolean', default: false })
  iepFlag: boolean;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  bloodGroup: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Guardian, (g) => g.student, { cascade: true, eager: false })
  guardians: Guardian[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
