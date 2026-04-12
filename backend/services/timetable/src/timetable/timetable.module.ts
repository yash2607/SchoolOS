import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TimetableEntry } from '../entities/timetable-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimetableEntry]),
    JwtModule.register({}),
  ],
  controllers: [TimetableController],
  providers: [TimetableService],
  exports: [TimetableService],
})
export class TimetableModule {}
