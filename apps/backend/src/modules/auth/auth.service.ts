import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
      ageRange: { min: 18, max: 99 },
      gender: 'both',
      maxDistanceKm: 100,
      interestsPriority: false,
      showMyAge: true,
      showMyDistance: true,
    };

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        age: dto.age,
        gender: dto.gender,
        bio: dto.bio,
        height: dto.height,
        interests: dto.interests || [],
        preferences: defaultPreferences,
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
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
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

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
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
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

