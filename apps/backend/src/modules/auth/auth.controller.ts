import { Controller, Post, Body, Get, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return user;
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
    // Only works if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // Only works if Google OAuth is configured
    const user = await this.authService.googleLogin(req.user);
    
    // Redirect to frontend with tokens
    // Use first origin from CORS_ORIGIN or default to localhost
    const corsOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : ['http://localhost:3000'];
    const frontendUrl = corsOrigins[0]; // Use first origin for OAuth redirect
    
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${user.accessToken}&refreshToken=${user.refreshToken}`,
    );
  }

  @Public()
  @Post('complete-onboarding')
  async completeOnboarding(@Body() dto: CompleteOnboardingDto) {
    return this.authService.completeOnboarding(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}

