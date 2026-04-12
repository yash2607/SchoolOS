import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Grade } from './grade.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  gradeId: string;

  @ManyToOne(() => Grade, (g) => g.sections)
  @JoinColumn({ name: 'gradeId' })
  grade: Grade;

  @Column({ type: 'varchar' })
  name: string; // e.g. "A", "B", "Sunflower"

  @Column({ type: 'uuid', nullable: true })
  classTeacherId: string | null; // userId of CLASS_TEACHER

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
