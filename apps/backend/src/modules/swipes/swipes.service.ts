import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SwipeDto } from './dto/swipe.dto';

@Injectable()
export class SwipesService {
  constructor(private prisma: PrismaService) {}

  async swipe(userId: string, dto: SwipeDto) {
    // Check if user is trying to swipe on themselves
    if (userId === dto.targetId) {
      throw new BadRequestException('Cannot swipe on yourself');
    }

    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.targetId },
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Check if there's a block between users
    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: dto.targetId },
          { blockerId: dto.targetId, blockedId: userId },
        ],
      },
    });

    if (block) {
      throw new BadRequestException('Cannot swipe on blocked user');
    }

    // Check if already swiped
    const existingSwipe = await this.prisma.swipe.findUnique({
      where: {
        swiperId_targetId: {
          swiperId: userId,
          targetId: dto.targetId,
        },
      },
    });

    if (existingSwipe) {
      throw new BadRequestException('Already swiped on this user');
    }

    // Create swipe
    const swipe = await this.prisma.swipe.create({
      data: {
        swiperId: userId,
        targetId: dto.targetId,
        direction: dto.direction,
      },
    });

    // Check for match (only if direction is 'like' or 'superlike')
    if (dto.direction === 'like' || dto.direction === 'superlike') {
      const reverseSwipe = await this.prisma.swipe.findUnique({
        where: {
          swiperId_targetId: {
            swiperId: dto.targetId,
            targetId: userId,
          },
        },
      });

      // If the other user has also liked/superliked, create a match
      if (reverseSwipe && (reverseSwipe.direction === 'like' || reverseSwipe.direction === 'superlike')) {
        // Check if match already exists
        const existingMatch = await this.prisma.match.findFirst({
          where: {
            OR: [
              { user1Id: userId, user2Id: dto.targetId },
              { user1Id: dto.targetId, user2Id: userId },
            ],
          },
        });

        if (!existingMatch) {
          // Create match (user1Id should be smaller for consistency)
          const user1Id = userId < dto.targetId ? userId : dto.targetId;
          const user2Id = userId < dto.targetId ? dto.targetId : userId;

          const match = await this.prisma.match.create({
            data: {
              user1Id,
              user2Id,
            },
            include: {
              user1: {
                select: {
                  id: true,
                  name: true,
                  age: true,
                  photos: {
                    take: 1,
                    orderBy: { createdAt: 'asc' },
                  },
                },
              },
              user2: {
                select: {
                  id: true,
                  name: true,
                  age: true,
                  photos: {
                    take: 1,
                    orderBy: { createdAt: 'asc' },
                  },
                },
              },
            },
          });

          return {
            swipe,
            match,
            isMatch: true,
          };
        }
      }
    }

    return {
      swipe,
      match: null,
      isMatch: false,
    };
  }
}

