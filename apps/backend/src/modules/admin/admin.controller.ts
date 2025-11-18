import {
  Controller,
  Get,
  Delete,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Delete('users/:id')
  async deleteUser(@CurrentUser() admin: any, @Param('id') id: string) {
    return this.adminService.deleteUser(admin.id, id);
  }

  @Get('swipes')
  async getAllSwipes() {
    return this.adminService.getAllSwipes();
  }

  @Get('matches')
  async getAllMatches() {
    return this.adminService.getAllMatches();
  }

  @Get('chats/:matchId')
  async getChatMessages(@Param('matchId') matchId: string) {
    return this.adminService.getChatMessages(matchId);
  }

  @Get('reports')
  async getAllReports() {
    return this.adminService.getAllReports();
  }

  @Post('reports/resolve')
  async resolveReport(@CurrentUser() admin: any, @Body('reportId') reportId: string) {
    return this.adminService.resolveReport(admin.id, reportId);
  }

  @Get('logs')
  async getAllLogs() {
    return this.adminService.getAllLogs();
  }

  @Delete('photos/:photoId')
  async deletePhoto(@CurrentUser() admin: any, @Param('photoId') photoId: string) {
    return this.adminService.deletePhoto(admin.id, photoId);
  }

  @Post('matches/:matchId/unmatch')
  async forceUnmatch(@CurrentUser() admin: any, @Param('matchId') matchId: string) {
    return this.adminService.forceUnmatch(admin.id, matchId);
  }

  @Delete('messages/:messageId')
  async deleteMessage(@CurrentUser() admin: any, @Param('messageId') messageId: string) {
    return this.adminService.deleteMessage(admin.id, messageId);
  }

  @Post('block')
  async blockUser(
    @CurrentUser() admin: any,
    @Body('blockerId') blockerId: string,
    @Body('blockedId') blockedId: string,
  ) {
    return this.adminService.blockUser(admin.id, blockerId, blockedId);
  }
}

