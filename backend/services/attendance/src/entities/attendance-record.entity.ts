import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('attendance_records')
@Unique(['studentId', 'date', 'periodNumber'])
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  schoolId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'uuid' })
  sectionId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'varchar',
    default: 'absent',
  })
  status: 'present' | 'absent' | 'late' | 'on_leave';

  @Column({ type: 'uuid' })
  markedByUserId: string;

  @Column({ type: 'timestamptz' })
  markedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  editedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  editReason: string | null;

  @Column({ type: 'int', nullable: true })
  periodNumber: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
