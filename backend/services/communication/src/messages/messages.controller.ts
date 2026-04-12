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
import { MessagesGateway } from './messages.gateway';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { JwtPayload } from '../common/jwt.guard';
import { CreateThreadDto, SendMessageDto, PaginationDto } from './dto/message.dto';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

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
      user.schoolId,
      threadId,
      user.sub,
      pagination.page ?? 1,
      pagination.limit ?? 30,
    );
  }

  @Post('messages/threads')
  @ApiOperation({ summary: 'Create thread or get existing' })
  createOrGetThread(@CurrentUser() user: JwtPayload, @Body() dto: CreateThreadDto) {
    return this.messagesService.createOrGetThread(user.schoolId, user.sub, dto);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(@CurrentUser() user: JwtPayload, @Body() dto: SendMessageDto) {
    const message = await this.messagesService.sendMessage(user.schoolId, user.sub, dto);
    this.messagesGateway.emitMessage(message);
    return message;
  }

  @Patch('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  markRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.messagesService.markRead(user.schoolId, id, user.sub);
  }
}
