import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('periods')
export class Period {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  schoolId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  startTime: string;

  @Column({ type: 'varchar' })
  endTime: string;

  @Column({ type: 'int' })
  periodNumber: number;

  @Column({ type: 'int', nullable: true })
  dayOfWeek: number | null;

  @Column({ type: 'boolean', default: false })
  isBreak: boolean;

  @Column({ type: 'int' })
  order: number;
}
