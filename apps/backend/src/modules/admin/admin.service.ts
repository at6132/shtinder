import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        gender: true,
        bio: true,
        isAdmin: true,
        createdAt: true,
        lastActiveAt: true,
        photos: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        photos: {
          orderBy: { createdAt: 'asc' },
        },
        swipes: {
          include: {
            target: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        receivedSwipes: {
          include: {
            swiper: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        matches1: {
          include: {
            user2: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        matches2: {
          include: {
            user1: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteUser(adminId: string, userId: string) {
    // Log admin action
    await this.prisma.adminLog.create({
      data: {
        adminId,
        action: 'DELETE_USER',
        target: userId,
      },
    });

    // Delete user (cascade will handle related records)
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async getAllSwipes() {
    return this.prisma.swipe.findMany({
      include: {
        swiper: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllMatches() {
    return this.prisma.match.findMany({
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getChatMessages(matchId: string) {
    return this.prisma.message.findMany({
      where: { matchId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getAllReports() {
    return this.prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveReport(adminId: string, reportId: string) {
    await this.prisma.adminLog.create({
      data: {
        adminId,
        action: 'RESOLVE_REPORT',
        target: reportId,
      },
    });

    return this.prisma.report.update({
      where: { id: reportId },
      data: { resolved: true },
    });
  }

  async getAllLogs() {
    return this.prisma.adminLog.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deletePhoto(adminId: string, photoId: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new Error('Photo not found');
    }

    // Delete from S3
    await this.uploadService.deleteFile(photo.url);

    // Log admin action
    await this.prisma.adminLog.create({
      data: {
        adminId,
        action: 'DELETE_PHOTO',
        target: photoId,
      },
    });

    // Delete from database
    return this.prisma.photo.delete({
      where: { id: photoId },
    });
  }

  async forceUnmatch(adminId: string, matchId: string) {
    await this.prisma.adminLog.create({
      data: {
        adminId,
        action: 'FORCE_UNMATCH',
        target: matchId,
      },
    });

    return this.prisma.match.update({
      where: { id: matchId },
      data: { unmatched: true },
    });
  }

  async deleteMessage(adminId: string, messageId: string) {
    await this.prisma.adminLog.create({
      data: {
        adminId,
        action: 'DELETE_MESSAGE',
        target: messageId,
      },
    });

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  async blockUser(adminId: string, blockerId: string, blockedId: string) {
    await this.prisma.adminLog.create({
      data: {
        adminId,
        action: 'BLOCK_USER',
        target: `${blockerId}-${blockedId}`,
      },
    });

    // Create block
    const block = await this.prisma.block.create({
      data: {
        blockerId,
        blockedId,
      },
    });

    // Unmatch if they have a match
    await this.prisma.match.updateMany({
      where: {
        OR: [
          { user1Id: blockerId, user2Id: blockedId },
          { user1Id: blockedId, user2Id: blockerId },
        ],
        unmatched: false,
      },
      data: { unmatched: true },
    });

    return block;
  }
}

