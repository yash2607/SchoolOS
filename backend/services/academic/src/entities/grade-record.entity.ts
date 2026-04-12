import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('grade_records')
@Unique(['assignmentId', 'studentId'])
export class GradeRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  assignmentId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'uuid' })
  schoolId: string;

  @Column({ type: 'decimal', nullable: true })
  score: number | null;

  @Column({ type: 'decimal', default: 100 })
  maxScore: number;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ type: 'uuid', nullable: true })
  gradedByUserId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  parentAckAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
