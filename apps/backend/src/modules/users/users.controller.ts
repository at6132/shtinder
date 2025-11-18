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
    return this.usersService.discover(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
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
}

