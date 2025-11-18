import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { SwipesService } from './swipes.service';
import { SwipeDto } from './dto/swipe.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('swipes')
export class SwipesController {
  constructor(private swipesService: SwipesService) {}

  @Post('like')
  async like(@CurrentUser() user: any, @Body() dto: SwipeDto) {
    return this.swipesService.swipe(user.id, { ...dto, direction: 'like' });
  }

  @Post('dislike')
  async dislike(@CurrentUser() user: any, @Body() dto: SwipeDto) {
    return this.swipesService.swipe(user.id, { ...dto, direction: 'dislike' });
  }

  @Post('superlike')
  async superlike(@CurrentUser() user: any, @Body() dto: SwipeDto) {
    return this.swipesService.swipe(user.id, { ...dto, direction: 'superlike' });
  }

  @Delete('undo/:targetId')
  async undo(@CurrentUser() user: any, @Param('targetId') targetId: string) {
    return this.swipesService.undoSwipe(user.id, targetId);
  }
}

