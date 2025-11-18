import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        photos: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserById(userId: string, requesterId: string) {
    // Check if requester is blocked by this user or vice versa
    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: requesterId },
          { blockerId: requesterId, blockedId: userId },
        ],
      },
    });

    if (block) {
      throw new ForbiddenException('User not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        photos: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
      include: {
        photos: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async addPhoto(userId: string, photoUrl: string) {
    const photo = await this.prisma.photo.create({
      data: {
        url: photoUrl,
        userId,
      },
    });

    return photo;
  }

  async deletePhoto(userId: string, photoId: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo || photo.userId !== userId) {
      throw new NotFoundException('Photo not found');
    }

    await this.prisma.photo.delete({
      where: { id: photoId },
    });

    return { success: true };
  }

  async discover(userId: string, page: number = 1, limit: number = 10) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all users that the current user has already swiped on
    const swipedUserIds = await this.prisma.swipe.findMany({
      where: { swiperId: userId },
      select: { targetId: true },
    });

    const swipedIds = swipedUserIds.map((s) => s.targetId);

    // Get all users that have blocked or been blocked by current user
    const blocks = await this.prisma.block.findMany({
      where: {
        OR: [{ blockerId: userId }, { blockedId: userId }],
      },
    });

    const blockedIds = blocks.flatMap((b) =>
      b.blockerId === userId ? [b.blockedId] : [b.blockerId],
    );

    // Get all users that have matched with current user
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        unmatched: false,
      },
    });

    const matchedIds = matches.flatMap((m) =>
      m.user1Id === userId ? [m.user2Id] : [m.user1Id],
    );

    // Exclude current user, swiped users, blocked users, and matched users
    const excludeIds = [userId, ...swipedIds, ...blockedIds, ...matchedIds];

    // Build query with preferences
    const preferences = user.preferences as any;
    const genderFilter =
      preferences?.gender === 'both'
        ? {}
        : preferences?.gender === 'male'
        ? { gender: 'male' }
        : preferences?.gender === 'female'
        ? { gender: 'female' }
        : {};

    const ageRange = preferences?.ageRange || { min: 18, max: 99 };

    // Get potential matches
    let potentialMatches = await this.prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        ...genderFilter,
        age: {
          gte: ageRange.min,
          lte: ageRange.max,
        },
      },
      include: {
        photos: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
      take: limit * 3, // Get more to filter by distance
      skip: (page - 1) * limit * 3,
    });

    // Filter by distance if user has location
    if (user.latitude && user.longitude && preferences?.maxDistanceKm) {
      potentialMatches = potentialMatches.filter((match) => {
        if (!match.latitude || !match.longitude) return false;
        const distance = this.calculateDistance(
          user.latitude,
          user.longitude,
          match.latitude,
          match.longitude,
        );
        return distance <= preferences.maxDistanceKm;
      });
    }

    // Sort by interests priority if enabled
    if (preferences?.interestsPriority && user.interests.length > 0) {
      potentialMatches.sort((a, b) => {
        const aCommon = a.interests.filter((i) => user.interests.includes(i)).length;
        const bCommon = b.interests.filter((i) => user.interests.includes(i)).length;
        return bCommon - aCommon;
      });
    }

    // Add distance to each match
    const matchesWithDistance = potentialMatches.map((match) => {
      let distance = null;
      if (user.latitude && user.longitude && match.latitude && match.longitude) {
        distance = this.calculateDistance(
          user.latitude,
          user.longitude,
          match.latitude,
          match.longitude,
        );
      }

      const { password, ...matchWithoutPassword } = match;
      return {
        ...matchWithoutPassword,
        distance: preferences?.showMyDistance ? Math.round(distance) : null,
      };
    });

    // Return paginated results
    return matchesWithDistance.slice(0, limit);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

