import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Section } from './section.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  schoolId: string;

  @Column({ type: 'varchar' })
  name: string; // e.g. "Grade 6", "Class 1"

  @Column({ type: 'int' })
  order: number; // for sorting

  @OneToMany(() => Section, (s) => s.grade, { cascade: true, eager: false })
  sections: Section[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
