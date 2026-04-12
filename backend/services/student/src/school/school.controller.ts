import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SchoolService } from './school.service';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { JwtPayload } from '../common/jwt.guard';
import {
  CreateAcademicYearDto,
  CreateGradeDto,
  CreateSectionDto,
  CreateSubjectDto,
  UpdateSchoolDto,
} from './dto/create-school-setup.dto';

@ApiTags('school-setup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('school')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get()
  @ApiOperation({ summary: 'Get my school details' })
  getSchool(@CurrentUser() user: JwtPayload) {
    return this.schoolService.getSchool(user.schoolId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update school profile' })
  updateSchool(@CurrentUser() user: JwtPayload, @Body() dto: UpdateSchoolDto) {
    return this.schoolService.updateSchool(user.schoolId, dto);
  }

  // ─── Academic Years ──────────────────────────────────────────────
  @Get('academic-years')
  getYears(@CurrentUser() user: JwtPayload) {
    return this.schoolService.getAcademicYears(user.schoolId);
  }

  @Post('academic-years')
  createYear(@CurrentUser() user: JwtPayload, @Body() dto: CreateAcademicYearDto) {
    return this.schoolService.createAcademicYear(user.schoolId, dto);
  }

  @Patch('academic-years/:id/activate')
  activateYear(@CurrentUser() user: JwtPayload, @Param('id') yearId: string) {
    return this.schoolService.setActiveYear(user.schoolId, yearId);
  }

  // ─── Grades ──────────────────────────────────────────────────────
  @Get('grades')
  @ApiOperation({ summary: 'List grades with sections' })
  getGrades(@CurrentUser() user: JwtPayload) {
    return this.schoolService.getGrades(user.schoolId);
  }

  @Post('grades')
  createGrade(@CurrentUser() user: JwtPayload, @Body() dto: CreateGradeDto) {
    return this.schoolService.createGrade(user.schoolId, dto);
  }

  @Delete('grades/:id')
  deleteGrade(@CurrentUser() user: JwtPayload, @Param('id') gradeId: string) {
    return this.schoolService.deleteGrade(user.schoolId, gradeId);
  }

  // ─── Sections ────────────────────────────────────────────────────
  @Get('grades/:gradeId/sections')
  getSections(@CurrentUser() user: JwtPayload, @Param('gradeId') gradeId: string) {
    return this.schoolService.getSections(gradeId, user.schoolId);
  }

  @Post('grades/:gradeId/sections')
  createSection(
    @CurrentUser() user: JwtPayload,
    @Param('gradeId') gradeId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.schoolService.createSection(user.schoolId, gradeId, dto);
  }

  @Patch('sections/:sectionId')
  updateSection(
    @CurrentUser() user: JwtPayload,
    @Param('sectionId') sectionId: string,
    @Body() dto: Partial<CreateSectionDto>,
  ) {
    return this.schoolService.updateSection(user.schoolId, sectionId, dto);
  }

  // ─── Subjects ────────────────────────────────────────────────────
  @Get('subjects')
  getSubjects(@CurrentUser() user: JwtPayload) {
    return this.schoolService.getSubjects(user.schoolId);
  }

  @Post('subjects')
  createSubject(@CurrentUser() user: JwtPayload, @Body() dto: CreateSubjectDto) {
    return this.schoolService.createSubject(user.schoolId, dto);
  }

  @Delete('subjects/:id')
  deleteSubject(@CurrentUser() user: JwtPayload, @Param('id') subjectId: string) {
    return this.schoolService.deleteSubject(user.schoolId, subjectId);
  }
}
