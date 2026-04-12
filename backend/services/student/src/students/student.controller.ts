import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { JwtPayload } from '../common/jwt.guard';
import { CreateStudentDto, UpdateStudentDto, CreateGuardianDto, LinkGuardianDto } from './dto/create-student.dto';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // ─── Students ─────────────────────────────────────────────────────
  @Post('students')
  @ApiOperation({ summary: 'Enroll a student' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateStudentDto) {
    return this.studentService.create(user.schoolId, dto);
  }

  @Post('students/bulk')
  @ApiOperation({ summary: 'Bulk enroll students (array of student objects)' })
  bulkCreate(@CurrentUser() user: JwtPayload, @Body() body: { students: CreateStudentDto[] }) {
    return this.studentService.bulkCreate(user.schoolId, body.students);
  }

  @Get('students')
  @ApiOperation({ summary: 'List students' })
  @ApiQuery({ name: 'gradeId', required: false })
  @ApiQuery({ name: 'sectionId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'transferred', 'withdrawn'] })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('gradeId') gradeId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.studentService.findAll(user.schoolId, {
      ...(gradeId ? { gradeId } : {}),
      ...(sectionId ? { sectionId } : {}),
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    });
  }

  @Get('students/:id')
  @ApiOperation({ summary: 'Get student profile' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.studentService.findOne(user.schoolId, id);
  }

  @Patch('students/:id')
  @ApiOperation({ summary: 'Update student' })
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentService.update(user.schoolId, id, dto);
  }

  @Delete('students/:id')
  @ApiOperation({ summary: 'Withdraw student (soft delete)' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.studentService.softDelete(user.schoolId, id);
  }

  // ─── Roster (teacher view) ────────────────────────────────────────
  @Get('sections/:sectionId/roster')
  @ApiOperation({ summary: 'Get class roster for a section (teacher/admin)' })
  getRoster(@CurrentUser() user: JwtPayload, @Param('sectionId') sectionId: string) {
    return this.studentService.getRoster(user.schoolId, sectionId);
  }

  // ─── Guardians ────────────────────────────────────────────────────
  @Post('students/:id/guardians')
  @ApiOperation({ summary: 'Add guardian to student' })
  addGuardian(
    @CurrentUser() user: JwtPayload,
    @Param('id') studentId: string,
    @Body() dto: CreateGuardianDto,
  ) {
    return this.studentService.addGuardian(user.schoolId, studentId, dto);
  }

  @Patch('students/:id/guardians/link')
  @ApiOperation({ summary: 'Link guardian to an app user account' })
  linkGuardian(
    @CurrentUser() user: JwtPayload,
    @Param('id') studentId: string,
    @Body() dto: LinkGuardianDto,
  ) {
    return this.studentService.linkGuardianToUser(user.schoolId, studentId, dto);
  }

  // ─── Parent: my children ──────────────────────────────────────────
  @Get('me/children')
  @ApiOperation({ summary: 'Get parent\'s linked children' })
  getMyChildren(@CurrentUser() user: JwtPayload) {
    return this.studentService.getChildrenForParent(user.sub);
  }
}
