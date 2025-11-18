import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMessages(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new ForbiddenException('Not authorized to view this chat');
    }

    const messages = await this.prisma.message.findMany({
      where: { matchId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            photos: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages;
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new ForbiddenException('Not authorized to send message');
    }

    if (match.unmatched) {
      throw new ForbiddenException('Match has been unmatched');
    }

    const receiverId = match.user1Id === userId ? match.user2Id : match.user1Id;

    const message = await this.prisma.message.create({
      data: {
        matchId: dto.matchId,
        senderId: userId,
        receiverId,
        content: dto.content,
        type: dto.type,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            photos: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return message;
  }

  async markAsRead(userId: string, matchId: string) {
    await this.prisma.message.updateMany({
      where: {
        matchId,
        receiverId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  }
}

