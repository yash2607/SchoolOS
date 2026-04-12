import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('school_events')
export class SchoolEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  schoolId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'date' })
  eventDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({
    type: 'varchar',
    default: 'event',
  })
  eventType: 'holiday' | 'exam' | 'event' | 'ptm';

  @Column({
    type: 'varchar',
    default: 'school',
  })
  targetType: 'school' | 'grade' | 'section';

  @Column({ type: 'uuid', nullable: true })
  targetId: string | null;

  @Column({ type: 'uuid' })
  createdByUserId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
