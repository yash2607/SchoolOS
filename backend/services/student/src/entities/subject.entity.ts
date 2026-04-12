import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  schoolId: string;

  @Column({ type: 'varchar' })
  name: string; // e.g. "Mathematics"

  @Column({ type: 'varchar', nullable: true })
  code: string | null; // e.g. "MATH-6"

  @Column({ type: 'varchar', default: 'core' })
  type: 'core' | 'elective' | 'activity';

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
