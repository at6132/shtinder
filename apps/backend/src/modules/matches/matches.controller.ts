import { Controller, Get, Post, Body } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { UnmatchDto } from './dto/unmatch.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  async getMatches(@CurrentUser() user: any) {
    return this.matchesService.getMatches(user.id);
  }

  @Public()
  @Get('count')
  async getTotalMatchesCount() {
    const count = await this.matchesService.getTotalMatchesCount();
    return { count };
  }

  @Post('unmatch')
  async unmatch(@CurrentUser() user: any, @Body() dto: UnmatchDto) {
    return this.matchesService.unmatch(user.id, dto);
  }
}

