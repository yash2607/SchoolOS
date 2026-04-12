import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('submissions')
@Unique(['assignmentId', 'studentId'])
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  assignmentId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'json', default: () => "'[]'" })
  attachmentKeys: string[];

  @Column({ type: 'varchar', default: 'not_submitted' })
  status: 'not_submitted' | 'submitted' | 'late';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
