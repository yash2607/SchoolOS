import {
  Controller,
  Get,
  Post,
  Patch,
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
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { JwtPayload } from '../common/jwt.guard';
import {
  MarkAttendanceDto,
  EditAttendanceDto,
  SubmitLeaveRequestDto,
  ReviewLeaveRequestDto,
} from './dto/mark-attendance.dto';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ─── Mark attendance ──────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Bulk mark attendance for a section+date (upsert)' })
  markBulk(@CurrentUser() user: JwtPayload, @Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markBulk(user.schoolId, user.sub, dto);
  }

  // ─── Edit a record ────────────────────────────────────────────────────────

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an attendance record (requires editReason)' })
  editRecord(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: EditAttendanceDto,
  ) {
    return this.attendanceService.editRecord(user.schoolId, id, dto);
  }

  // ─── Roster ───────────────────────────────────────────────────────────────

  @Get('roster')
  @ApiOperation({ summary: 'Get attendance roster for a section+date' })
  @ApiQuery({ name: 'sectionId', required: true })
  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({ name: 'periodNumber', required: false, type: Number })
  getRoster(
    @CurrentUser() user: JwtPayload,
    @Query('sectionId') sectionId: string,
    @Query('date') date: string,
    @Query('periodNumber') periodNumber?: string,
  ) {
    const pn = periodNumber !== undefined ? parseInt(periodNumber, 10) : undefined;
    return this.attendanceService.getRoster(user.schoolId, sectionId, date, pn);
  }

  // ─── School summary ───────────────────────────────────────────────────────

  @Get('school/summary')
  @ApiOperation({ summary: 'School-wide attendance summary by section for a date (admin)' })
  @ApiQuery({ name: 'date', required: true })
  getSchoolSummary(@CurrentUser() user: JwtPayload, @Query('date') date: string) {
    return this.attendanceService.getSchoolSummary(user.schoolId, date);
  }

  // ─── Student history ──────────────────────────────────────────────────────

  @Get('student/:studentId')
  @ApiOperation({ summary: "Get student's attendance history for a month" })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  getStudentHistory(
    @CurrentUser() user: JwtPayload,
    @Param('studentId') studentId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.attendanceService.getStudentHistory(
      user.schoolId,
      studentId,
      parseInt(month, 10),
      parseInt(year, 10),
    );
  }

  // ─── Section summary ──────────────────────────────────────────────────────

  @Get('section/:sectionId/summary')
  @ApiOperation({ summary: 'Section attendance % report for a date range' })
  @ApiQuery({ name: 'fromDate', required: true })
  @ApiQuery({ name: 'toDate', required: true })
  getSectionSummary(
    @CurrentUser() user: JwtPayload,
    @Param('sectionId') sectionId: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    return this.attendanceService.getSectionSummary(user.schoolId, sectionId, fromDate, toDate);
  }

  // ─── Leave requests ───────────────────────────────────────────────────────

  @Post('leave')
  @ApiOperation({ summary: 'Submit a leave request' })
  submitLeave(@CurrentUser() user: JwtPayload, @Body() dto: SubmitLeaveRequestDto) {
    return this.attendanceService.submitLeave(user.schoolId, user.sub, dto);
  }

  @Get('leave')
  @ApiOperation({ summary: 'List leave requests (admin)' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected'] })
  findLeaveRequests(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
  ) {
    return this.attendanceService.findLeaveRequests(user.schoolId, status);
  }

  @Patch('leave/:id')
  @ApiOperation({ summary: 'Approve or reject a leave request' })
  reviewLeave(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ReviewLeaveRequestDto,
  ) {
    return this.attendanceService.reviewLeave(user.schoolId, id, user.sub, dto);
  }
}
