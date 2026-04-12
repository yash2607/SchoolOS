import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { Assignment } from '../entities/assignment.entity';
import { Submission } from '../entities/submission.entity';
import { GradeRecord } from '../entities/grade-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment, Submission, GradeRecord]),
    JwtModule.register({}),
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
