import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  async createReport(@CurrentUser() user: any, @Body() dto: CreateReportDto) {
    return this.reportsService.createReport(user.id, dto);
  }
}

