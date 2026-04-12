import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceRecord } from '../entities/attendance-record.entity';
import { LeaveRequest } from '../entities/leave-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecord, LeaveRequest]),
    JwtModule.register({}),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
