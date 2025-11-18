import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UnmatchDto } from './dto/unmatch.dto';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async getMatches(userId: string) {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        unmatched: false,
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            photos: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            photos: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to return the other user (not the current user)
    return matches.map((match) => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1;
      const lastMessage = match.messages[0] || null;

      return {
        id: match.id,
        user: otherUser,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              type: lastMessage.type,
              createdAt: lastMessage.createdAt,
              senderId: lastMessage.senderId,
            }
          : null,
        createdAt: match.createdAt,
      };
    });
  }

  async unmatch(userId: string, dto: UnmatchDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new ForbiddenException('Not authorized to unmatch');
    }

    // Mark as unmatched instead of deleting (for admin visibility)
    await this.prisma.match.update({
      where: { id: dto.matchId },
      data: { unmatched: true },
    });

    return { success: true };
  }
}

