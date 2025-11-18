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
    const updateData: any = {
      ...dto,
      updatedAt: new Date(),
    };
    
    if (dto.preferences) {
      updateData.preferences = dto.preferences as any;
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
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

  async completeOnboardingForExistingUser(
    userId: string,
    bio?: string,
    height?: number,
    preferences?: any,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedPreferences = {
      ...(user.preferences as any),
      ...preferences,
    };

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        bio: bio !== undefined ? bio : user.bio,
        height: height !== undefined ? height : user.height,
        preferences: updatedPreferences,
        onboardingComplete: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        gender: true,
        bio: true,
        height: true,
        interests: true,
        isAdmin: true,
        onboardingComplete: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  async setMainPhoto(userId: string, photoId: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo || photo.userId !== userId) {
      throw new NotFoundException('Photo not found');
    }

    // Get all user photos ordered by createdAt
    const allPhotos = await this.prisma.photo.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    // If it's already the first photo, return
    if (allPhotos[0]?.id === photoId) {
      return { success: true, message: 'Photo is already the main photo' };
    }

    // Delete the photo and recreate it with the earliest timestamp
    // This makes it the first photo (main photo)
    const earliestPhoto = allPhotos[0];
    const earliestDate = earliestPhoto ? earliestPhoto.createdAt : new Date(Date.now() - 1000000);

    // Delete and recreate with earlier timestamp
    await this.prisma.photo.delete({
      where: { id: photoId },
    });

    await this.prisma.photo.create({
      data: {
        url: photo.url,
        userId: photo.userId,
        createdAt: new Date(earliestDate.getTime() - 1000), // 1 second before the earliest
      },
    });

    return { success: true };
  }

  async discover(userId: string, page: number = 1, limit: number = 50) {
    console.log(`🔍 [Discover] Starting discovery for user: ${userId}, page: ${page}, limit: ${limit}`);
    
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.error(`❌ [Discover] User not found: ${userId}`);
        throw new NotFoundException('User not found');
      }

      console.log(`✅ [Discover] User found: ${user.email}, gender: ${user.gender}`);
      
      // Check if user has completed onboarding
      if (!user.onboardingComplete) {
        console.warn(`⚠️ [Discover] User ${userId} has not completed onboarding`);
        return [];
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

      // Exclude current user, swiped users, and blocked users
      // NOTE: NOT excluding matched users - allow unlimited swiping
      const excludeIds = [userId, ...swipedIds, ...blockedIds];

      // Simple logic: Guys see all girls, Girls see all guys
      // Handle "other" gender - show both male and female
      let genderFilter: any = {};
      if (user.gender === 'male') {
        genderFilter = { gender: 'female' };
      } else if (user.gender === 'female') {
        genderFilter = { gender: 'male' };
      } else {
        // For "other" gender, show both male and female
        genderFilter = { gender: { in: ['male', 'female'] } };
      }

      console.log(`📊 [Discover] User gender: ${user.gender}, Filter:`, JSON.stringify(genderFilter));
      console.log(`📊 [Discover] Excluding ${excludeIds.length} users`);

      // Get all users of opposite gender (unlimited, no age/preference filtering)
      const potentialMatches = await this.prisma.user.findMany({
        where: {
          id: { notIn: excludeIds },
          onboardingComplete: true,
          ...genderFilter,
        },
        include: {
          photos: {
            orderBy: { createdAt: 'asc' },
          },
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' }, // Show newest first
      });

      console.log(`📊 [Discover] Found ${potentialMatches.length} potential matches`);
      
      // Debug: Check total users in database
      const totalUsers = await this.prisma.user.count({
        where: { onboardingComplete: true },
      });
      const totalOppositeGender = await this.prisma.user.count({
        where: {
          onboardingComplete: true,
          ...genderFilter,
        },
      });
      console.log(`📊 [Discover] Total users with onboarding: ${totalUsers}`);
      console.log(`📊 [Discover] Total ${user.gender === 'male' ? 'female' : user.gender === 'female' ? 'male' : 'opposite'} users: ${totalOppositeGender}`);

      // Remove password and prepare results
      const result = potentialMatches.map((match) => {
        const { password, ...matchWithoutPassword } = match;
        return matchWithoutPassword;
      });

      console.log(`✅ [Discover] Returning ${result.length} users`);
      return result;
    } catch (error) {
      console.error(`❌ [Discover] Error in discover method:`, {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
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

