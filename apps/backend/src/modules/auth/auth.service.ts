import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const defaultPreferences = {
      ageRange: { min: 14, max: 99 },
      gender: 'both',
      maxDistanceKm: 100,
      interestsPriority: false,
      showMyAge: true,
      showMyDistance: true,
    };

    // Don't create user yet - just validate and return temp token
    // User will be created after onboarding completes
    const tempToken = this.jwtService.sign(
      { email: dto.email, temp: true },
      { secret: process.env.JWT_SECRET, expiresIn: '1h' },
    );

    return {
      tempToken,
      registrationData: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        age: dto.age,
        gender: dto.gender,
        bio: dto.bio,
        height: dto.height,
        interests: dto.interests || [],
      },
    };
  }

  async login(dto: LoginDto) {
    try {
      console.log(`🔐 [Login] Attempting login for email: ${dto.email}`);
      
      if (!this.prisma) {
        console.error('❌ [Login] PrismaService is not initialized');
        throw new Error('Database service not available');
      }

      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      console.log(`🔍 [Login] User lookup result:`, user ? `Found user ${user.id}` : 'User not found');

      if (!user || !user.password) {
        console.warn(`⚠️ [Login] Invalid credentials for email: ${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);

      if (!isPasswordValid) {
        console.warn(`⚠️ [Login] Invalid password for email: ${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log(`✅ [Login] Password validated for user: ${user.id}`);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      });

      const tokens = await this.generateTokens(user.id, user.email);
      console.log(`✅ [Login] Login successful for user: ${user.id}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          age: user.age,
          gender: user.gender,
          bio: user.bio,
          height: user.height,
          interests: user.interests,
          isAdmin: user.isAdmin,
          onboardingComplete: user.onboardingComplete,
          createdAt: user.createdAt,
        },
        ...tokens,
      };
    } catch (error) {
      console.error(`❌ [Login] Login error:`, {
        email: dto.email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    return user;
  }

  async googleLogin(profile: any) {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.emails[0].value },
    });

    if (!user) {
      const defaultPreferences = {
        ageRange: { min: 18, max: 99 },
        gender: 'both',
        maxDistanceKm: 100,
        interestsPriority: false,
        showMyAge: true,
        showMyDistance: true,
      };

      user = await this.prisma.user.create({
        data: {
          email: profile.emails[0].value,
          name: profile.displayName || profile.name.givenName,
          age: 25, // Default, user should update
          gender: 'other', // Default, user should update
          interests: [],
          preferences: defaultPreferences,
        },
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
        bio: user.bio,
        height: user.height,
        interests: user.interests,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async completeOnboarding(dto: CompleteOnboardingDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const defaultPreferences = {
      ageRange: { min: 14, max: 99 },
      gender: 'both',
      maxDistanceKm: 100,
      interestsPriority: false,
      showMyAge: true,
      showMyDistance: true,
      ...dto.preferences,
    };

    // Create the user account now that onboarding is complete
    console.log(`📝 [Auth Onboarding] Creating new user account with onboarding complete`, {
      email: dto.email,
      name: dto.name,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password,
        name: dto.name,
        age: dto.age,
        gender: dto.gender,
        bio: dto.bio,
        height: dto.height,
        interests: [],
        preferences: defaultPreferences,
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

    // Verify the user was created with onboardingComplete: true
    const verification = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        onboardingComplete: true,
      },
    });

    if (!verification || !verification.onboardingComplete) {
      console.error(`❌ [Auth Onboarding] CRITICAL: User created but onboardingComplete is false!`, {
        userId: user.id,
        onboardingComplete: verification?.onboardingComplete,
      });
      throw new Error('Failed to create user with onboarding complete');
    }

    console.log(`✅ [Auth Onboarding] User created successfully with onboarding complete:`, {
      userId: user.id,
      email: user.email,
      onboardingComplete: user.onboardingComplete,
      verified: verification.onboardingComplete,
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-in-production',
      });

      const user = await this.validateUser(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user.id, user.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-in-production',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

