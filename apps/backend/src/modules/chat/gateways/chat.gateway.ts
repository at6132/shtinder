import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId
  private typingUsers = new Map<string, Set<string>>(); // matchId -> Set of userIds

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const userId = payload.sub;
      this.userSockets.set(userId, client.id);
      client.data.userId = userId;

      // Join user's personal room
      client.join(`user:${userId}`);

      console.log(`User ${userId} connected`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('message:send')
  async handleMessage(@MessageBody() dto: SendMessageDto, @ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      const message = await this.chatService.sendMessage(userId, dto);

      // Emit to both users in the match
      this.server.to(`match:${dto.matchId}`).emit('message:receive', message);

      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('match:join')
  async handleJoinMatch(@MessageBody() matchId: string, @ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    client.join(`match:${matchId}`);
    return { success: true };
  }

  @SubscribeMessage('match:leave')
  async handleLeaveMatch(@MessageBody() matchId: string, @ConnectedSocket() client: Socket) {
    client.leave(`match:${matchId}`);
    return { success: true };
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(@MessageBody() data: { matchId: string }, @ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    if (!this.typingUsers.has(data.matchId)) {
      this.typingUsers.set(data.matchId, new Set());
    }
    this.typingUsers.get(data.matchId).add(userId);

    // Notify other user
    client.to(`match:${data.matchId}`).emit('typing:start', { userId });
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(@MessageBody() data: { matchId: string }, @ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    if (this.typingUsers.has(data.matchId)) {
      this.typingUsers.get(data.matchId).delete(userId);
    }

    // Notify other user
    client.to(`match:${data.matchId}`).emit('typing:stop', { userId });
  }

  @SubscribeMessage('message:seen')
  async handleMessageSeen(@MessageBody() data: { matchId: string }, @ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      await this.chatService.markAsRead(userId, data.matchId);
      
      // Notify sender that messages were seen
      client.to(`match:${data.matchId}`).emit('message:seen', { matchId: data.matchId, userId });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

