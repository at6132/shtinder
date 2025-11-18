import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get(':matchId')
  async getMessages(@CurrentUser() user: any, @Param('matchId') matchId: string) {
    return this.chatService.getMessages(user.id, matchId);
  }

  @Post('send')
  async sendMessage(@CurrentUser() user: any, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(user.id, dto);
  }

  @Post(':matchId/read')
  async markAsRead(@CurrentUser() user: any, @Param('matchId') matchId: string) {
    return this.chatService.markAsRead(user.id, matchId);
  }
}

