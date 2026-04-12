import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('student_invoices')
export class StudentInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  schoolId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'uuid' })
  feeItemId: string;

  @Column({ type: 'varchar' })
  academicYear: string;

  @Column({ type: 'bigint' })
  dueAmount: number;

  @Column({ type: 'bigint', default: 0 })
  paidAmount: number;

  @Column({ type: 'varchar', default: 'unpaid' })
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';

  @Column({ type: 'date' })
  dueDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
