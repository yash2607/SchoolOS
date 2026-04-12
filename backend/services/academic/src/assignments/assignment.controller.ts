import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AssignmentService } from './assignment.service';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { JwtPayload } from '../common/jwt.guard';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  SubmitAssignmentDto,
  GradeSubmissionDto,
} from './dto/assignment.dto';

@ApiTags('assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  // ─── Assignments ─────────────────────────────────────────────────────────

  @Post('assignments')
  @ApiOperation({ summary: 'Create assignment' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAssignmentDto) {
    return this.assignmentService.create(user.schoolId, user.sub, dto);
  }

  @Get('assignments')
  @ApiOperation({ summary: 'List assignments' })
  @ApiQuery({ name: 'sectionId', required: false })
  @ApiQuery({ name: 'subjectId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published'] })
  @ApiQuery({ name: 'teacherUserId', required: false })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('sectionId') sectionId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('status') status?: string,
    @Query('teacherUserId') teacherUserId?: string,
  ) {
    return this.assignmentService.findAll(user.schoolId, {
      ...(sectionId ? { sectionId } : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(status ? { status } : {}),
      ...(teacherUserId ? { teacherUserId } : {}),
    });
  }

  @Get('assignments/:id')
  @ApiOperation({ summary: 'Get assignment detail with submission count' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.assignmentService.findOne(user.schoolId, id);
  }

  @Patch('assignments/:id')
  @ApiOperation({ summary: 'Update assignment (only draft)' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.assignmentService.update(user.schoolId, id, dto);
  }

  @Post('assignments/:id/publish')
  @ApiOperation({ summary: 'Publish assignment' })
  publish(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.assignmentService.publish(user.schoolId, id);
  }

  @Delete('assignments/:id')
  @ApiOperation({ summary: 'Soft delete assignment' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.assignmentService.softDelete(user.schoolId, id);
  }

  // ─── Submissions ──────────────────────────────────────────────────────────

  @Get('assignments/:id/submissions')
  @ApiOperation({ summary: 'List all submissions for an assignment' })
  listSubmissions(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.assignmentService.listSubmissions(user.schoolId, id);
  }

  @Post('assignments/:id/submissions')
  @ApiOperation({ summary: 'Student submits assignment' })
  submit(
    @CurrentUser() user: JwtPayload,
    @Param('id') assignmentId: string,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.assignmentService.submit(user.schoolId, assignmentId, user.sub, dto);
  }

  @Patch('assignments/:assignmentId/submissions/:studentId/grade')
  @ApiOperation({ summary: 'Grade a submission' })
  grade(
    @CurrentUser() user: JwtPayload,
    @Param('assignmentId') assignmentId: string,
    @Param('studentId') studentId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.assignmentService.gradeSubmission(user.schoolId, assignmentId, studentId, user.sub, dto);
  }

  @Patch('assignments/:assignmentId/submissions/:studentId/ack')
  @ApiOperation({ summary: 'Parent acknowledges grade' })
  parentAck(
    @CurrentUser() user: JwtPayload,
    @Param('assignmentId') assignmentId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.assignmentService.parentAck(assignmentId, studentId);
  }

  // ─── Gradebook ────────────────────────────────────────────────────────────
  // NOTE: static segment '/student' must be registered BEFORE the dynamic '/:sectionId'
  // so NestJS does not swallow the literal "student" as a sectionId.

  @Get('gradebook/student/:studentId')
  @ApiOperation({ summary: 'Get all graded assignments for a student grouped by subject' })
  gradebookStudent(@CurrentUser() user: JwtPayload, @Param('studentId') studentId: string) {
    return this.assignmentService.gradebookForStudent(studentId);
  }

  @Get('gradebook/:sectionId')
  @ApiOperation({ summary: 'Get gradebook for a section' })
  @ApiQuery({ name: 'subjectId', required: false })
  @ApiQuery({ name: 'academicYearId', required: false })
  gradebookSection(
    @CurrentUser() user: JwtPayload,
    @Param('sectionId') sectionId: string,
    @Query('subjectId') subjectId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.assignmentService.gradebookForSection(user.schoolId, sectionId, {
      ...(subjectId ? { subjectId } : {}),
      ...(academicYearId ? { academicYearId } : {}),
    });
  }
}
