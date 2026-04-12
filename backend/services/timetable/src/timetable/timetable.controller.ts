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
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { JwtPayload } from '../common/jwt.guard';
import { CreateTimetableEntryDto } from './dto/create-timetable-entry.dto';

@ApiTags('timetable')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  @ApiOperation({ summary: 'Get timetable entries (filtered by section, day, academicYear)' })
  @ApiQuery({ name: 'sectionId', required: false })
  @ApiQuery({ name: 'dayOfWeek', required: false, type: Number })
  @ApiQuery({ name: 'academicYearId', required: false })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('sectionId') sectionId?: string,
    @Query('dayOfWeek') dayOfWeek?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    const day = dayOfWeek !== undefined ? parseInt(dayOfWeek, 10) : undefined;
    return this.timetableService.findEntries(user.schoolId, sectionId, day, academicYearId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a timetable entry' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTimetableEntryDto) {
    return this.timetableService.create(user.schoolId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a timetable entry' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.timetableService.remove(user.schoolId, id);
  }

  @Get('teacher/:teacherUserId')
  @ApiOperation({ summary: "Get teacher's full week schedule grouped by dayOfWeek" })
  getTeacherSchedule(
    @CurrentUser() user: JwtPayload,
    @Param('teacherUserId') teacherUserId: string,
  ) {
    return this.timetableService.getTeacherSchedule(user.schoolId, teacherUserId);
  }

  @Get('today/:sectionId')
  @ApiOperation({ summary: "Get today's periods for a section with subject & teacher info" })
  getTodaySchedule(
    @CurrentUser() user: JwtPayload,
    @Param('sectionId') sectionId: string,
  ) {
    return this.timetableService.getTodaySchedule(user.schoolId, sectionId);
  }
}
