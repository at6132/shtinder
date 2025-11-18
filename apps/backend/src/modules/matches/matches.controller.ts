import { Controller, Get, Post, Body } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { UnmatchDto } from './dto/unmatch.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  async getMatches(@CurrentUser() user: any) {
    return this.matchesService.getMatches(user.id);
  }

  @Post('unmatch')
  async unmatch(@CurrentUser() user: any, @Body() dto: UnmatchDto) {
    return this.matchesService.unmatch(user.id, dto);
  }
}

