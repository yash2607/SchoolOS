import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { AcademicYear } from '../entities/academic-year.entity';
import { Grade } from '../entities/grade.entity';
import { Section } from '../entities/section.entity';
import { Subject } from '../entities/subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AcademicYear, Grade, Section, Subject]),
    JwtModule.register({}),
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
  exports: [SchoolService],
})
export class SchoolModule {}
