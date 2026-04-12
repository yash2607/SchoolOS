import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Student } from '../entities/student.entity';
import { Guardian } from '../entities/guardian.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Guardian]),
    JwtModule.register({}),
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
