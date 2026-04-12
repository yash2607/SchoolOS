import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  schoolId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'uuid', nullable: true })
  invoiceId: string | null;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', default: 'INR' })
  currency: string;

  @Column({ type: 'varchar', default: 'online' })
  method: 'online' | 'cash' | 'cheque' | 'bank_transfer';

  @Column({ type: 'varchar', nullable: true })
  gatewayOrderId: string | null;

  @Column({ type: 'varchar', nullable: true })
  gatewayPaymentId: string | null;

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'success' | 'failed' | 'refunded';

  @Column({ type: 'varchar', nullable: true })
  receiptKey: string | null;

  @Column({ type: 'varchar', nullable: true })
  notes: string | null;

  @Column({ type: 'uuid' })
  createdByUserId: string;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
