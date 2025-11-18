import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UploadService } from '../upload/upload.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private uploadService: UploadService,
  ) {}

  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Get('discover')
  async discover(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    try {
      console.log(`🔍 Discover request - User ID: ${user.id}, Page: ${page || 1}, Limit: ${limit || 50}`);
      const result = await this.usersService.discover(
        user.id,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 50,
      );
      console.log(`✅ Discover success - Found ${result?.length || 0} users`);
      return result;
    } catch (error) {
      console.error('❌ Discover error:', {
        userId: user?.id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.getUserById(id, user.id);
  }

  @Put('update')
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const photoUrl = await this.uploadService.uploadFile(file);
    return this.usersService.addPhoto(user.id, photoUrl);
  }

  @Delete('photos/:photoId')
  async deletePhoto(@CurrentUser() user: any, @Param('photoId') photoId: string) {
    const result = await this.usersService.deletePhoto(user.id, photoId);
    // Optionally delete from S3
    return result;
  }

  @Post('photos/:photoId/set-main')
  async setMainPhoto(@CurrentUser() user: any, @Param('photoId') photoId: string) {
    return this.usersService.setMainPhoto(user.id, photoId);
  }

  @Post('complete-onboarding')
  async completeOnboarding(
    @CurrentUser() user: any,
    @Body('bio') bio?: string,
    @Body('height') height?: number,
    @Body('preferences') preferences?: any,
  ) {
    try {
      console.log(`📝 [Onboarding Controller] Request received for user ${user.id}`, {
        hasBio: bio !== undefined,
        hasHeight: height !== undefined,
        hasPreferences: preferences !== undefined,
        body: { bio, height, preferences },
      });

      const result = await this.usersService.completeOnboardingForExistingUser(user.id, bio, height, preferences);
      
      console.log(`✅ [Onboarding Controller] Successfully completed onboarding for user ${user.id}`, {
        userId: result.id,
        onboardingComplete: result.onboardingComplete,
        email: result.email,
      });

      return result;
    } catch (error) {
      console.error(`❌ [Onboarding Controller] Error completing onboarding for user ${user.id}:`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

