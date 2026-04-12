import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('fee_items')
export class FeeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  schoolId: string;

  @Column({ type: 'uuid' })
  gradeId: string;

  @Column({ type: 'varchar' })
  academicYear: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', default: 'INR' })
  currency: string;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ type: 'varchar', default: 'fixed' })
  lateFeeType: 'fixed' | 'percentage';

  @Column({ type: 'decimal', default: 0 })
  lateFeeValue: number;

  @Column({ type: 'int', default: 0 })
  lateFeeAfterDays: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
