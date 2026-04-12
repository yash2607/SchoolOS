import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import type { JwtPayload } from '../common/jwt.guard';
import type { Message } from '../entities/message.entity';

type AuthenticatedSocket = Socket & { data: { user?: JwtPayload } };

@WebSocketGateway({
  namespace: 'messages',
  cors: {
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server?: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly messagesService: MessagesService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      client.data.user = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.get<string>('JWT_SECRET') ?? 'fallback-secret',
      });
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('thread:join')
  async joinThread(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { threadId?: string },
  ): Promise<{ ok: boolean; error?: string }> {
    const user = client.data.user;
    if (!user || !body.threadId) return { ok: false, error: 'Unauthorized' };

    await this.messagesService.verifyThreadAccess(user.schoolId, body.threadId, user.sub);
    await client.join(this.roomForThread(body.threadId));
    return { ok: true };
  }

  @SubscribeMessage('thread:leave')
  async leaveThread(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { threadId?: string },
  ): Promise<{ ok: boolean }> {
    if (body.threadId) {
      await client.leave(this.roomForThread(body.threadId));
    }
    return { ok: true };
  }

  emitMessage(message: Message): void {
    this.server
      ?.to(this.roomForThread(message.threadId))
      .emit('message:new', message);
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth['token'];
    if (typeof authToken === 'string' && authToken) return authToken;

    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7);
    }

    return null;
  }

  private roomForThread(threadId: string): string {
    return `thread:${threadId}`;
  }
}
