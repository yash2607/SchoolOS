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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { JwtPayload } from '../common/jwt.guard';
import { CreateThreadDto, SendMessageDto, PaginationDto } from './dto/message.dto';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('messages/threads')
  @ApiOperation({ summary: 'List my message threads with unread count' })
  listThreads(@CurrentUser() user: JwtPayload) {
    return this.messagesService.listThreads(user.schoolId, user.sub);
  }

  @Get('messages/threads/:threadId')
  @ApiOperation({ summary: 'Get thread messages (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getThreadMessages(
    @CurrentUser() user: JwtPayload,
    @Param('threadId') threadId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.messagesService.getThreadMessages(
      threadId,
      user.sub,
      pagination.page ?? 1,
      pagination.limit ?? 30,
    );
  }

  @Post('messages/threads')
  @ApiOperation({ summary: 'Create thread or get existing' })
  createOrGetThread(@CurrentUser() user: JwtPayload, @Body() dto: CreateThreadDto) {
    return this.messagesService.createOrGetThread(user.schoolId, dto);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  sendMessage(@CurrentUser() user: JwtPayload, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(user.sub, dto);
  }

  @Patch('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  markRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.messagesService.markRead(id, user.sub);
  }
}
