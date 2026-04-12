import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { JwtPayload } from '../common/jwt.guard';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ summary: 'Get events for a month (month=1..12, year=YYYY)' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  findByMonth(
    @CurrentUser() user: JwtPayload,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.calendarService.findByMonth(
      user.schoolId,
      parseInt(month, 10),
      parseInt(year, 10),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a school event or holiday' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateEventDto) {
    return this.calendarService.create(user.schoolId, user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a school event' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.calendarService.remove(user.schoolId, id);
  }
}
