import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { SchoolEvent } from '../entities/school-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SchoolEvent]),
    JwtModule.register({}),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
