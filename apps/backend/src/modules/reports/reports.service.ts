import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(reporterId: string, dto: CreateReportDto) {
    const report = await this.prisma.report.create({
      data: {
        reporterId,
        targetId: dto.targetId,
        reason: dto.reason,
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return report;
  }

  async getAllReports() {
    return this.prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveReport(reportId: string) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { resolved: true },
    });
  }
}

