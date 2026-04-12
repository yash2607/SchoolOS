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
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { JwtPayload } from '../common/jwt.guard';
import { CreateAnnouncementDto, AnnouncementListDto } from './dto/announcement.dto';

@ApiTags('announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post('announcements')
  @ApiOperation({ summary: 'Create announcement' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(user.schoolId, user.sub, dto);
  }

  @Get('announcements')
  @ApiOperation({ summary: 'List announcements for school (pinned first, newest first)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'schoolId', required: false })
  list(@CurrentUser() user: JwtPayload, @Query() query: AnnouncementListDto) {
    const schoolId = query.schoolId ?? user.schoolId;
    return this.announcementsService.list(schoolId, query.page ?? 1, query.limit ?? 20);
  }

  @Get('announcements/:id')
  @ApiOperation({ summary: 'Get single announcement' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.announcementsService.findOne(id, user.schoolId);
  }

  @Patch('announcements/:id/ack')
  @ApiOperation({ summary: 'Parent acknowledges announcement' })
  acknowledge(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.announcementsService.acknowledge(id, user.sub);
  }

  @Get('announcements/:id/ack-stats')
  @ApiOperation({ summary: 'Get acknowledgement stats (admin)' })
  ackStats(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.announcementsService.ackStats(id, user.schoolId);
  }

  @Delete('announcements/:id')
  @ApiOperation({ summary: 'Soft delete announcement' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.announcementsService.softDelete(id, user.schoolId);
  }
}
