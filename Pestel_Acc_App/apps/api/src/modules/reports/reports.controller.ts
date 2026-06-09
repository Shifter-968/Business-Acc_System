import {
  Controller, Get, Query, UseGuards, Res, Param, BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@pestel/shared';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // GET /reports/profit-loss?from=2026-01-01&to=2026-03-31
  @Get('profit-loss')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.VIEWER)
  @ApiOperation({ summary: 'Profit & Loss report (JSON)' })
  @ApiQuery({ name: 'from', example: '2026-01-01' })
  @ApiQuery({ name: 'to', example: '2026-03-31' })
  profitLoss(@Query('from') from: string, @Query('to') to: string) {
    if (!from || !to) throw new BadRequestException('from and to query params are required');
    return this.reportsService.profitLoss(from, to);
  }

  // GET /reports/aged-debtors
  @Get('aged-debtors')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.VIEWER)
  @ApiOperation({ summary: 'Aged debtors report (JSON)' })
  agedDebtors() {
    return this.reportsService.agedDebtors();
  }

  // GET /reports/balance-sheet?date=2026-03-31
  @Get('balance-sheet')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.VIEWER)
  @ApiOperation({ summary: 'Balance sheet snapshot (JSON)' })
  @ApiQuery({ name: 'date', example: '2026-03-31' })
  balanceSheet(@Query('date') date: string) {
    if (!date) throw new BadRequestException('date query param is required');
    return this.reportsService.balanceSheet(date);
  }

  // GET /reports/profit-loss/export?format=xlsx&from=2026-01-01&to=2026-03-31
  // GET /reports/aged-debtors/export?format=xlsx
  @Get(':type/export')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Export a report as XLSX or PDF file download' })
  @ApiQuery({ name: 'format', enum: ['xlsx', 'pdf'] })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'date', required: false })
  async exportReport(
    @Param('type') type: string,
    @Query('format') format: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('date') date: string,
    @Res() res: Response,
  ) {
    const validTypes = ['profit-loss', 'aged-debtors', 'balance-sheet'] as const;
    if (!validTypes.includes(type as typeof validTypes[number])) {
      throw new BadRequestException(`Unknown report type: ${type}`);
    }
    if (!format || !['xlsx', 'pdf'].includes(format)) {
      throw new BadRequestException('format must be xlsx or pdf');
    }

    const params: Record<string, string> = { from, to, date };

    if (format === 'xlsx') {
      const buf = await this.reportsService.exportXlsx(
        type as 'profit-loss' | 'aged-debtors' | 'balance-sheet',
        params,
      );
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-${new Date().toISOString().slice(0, 10)}.xlsx"`);
      res.send(buf);
    } else {
      const buf = await this.reportsService.exportPdf(
        type as 'profit-loss' | 'aged-debtors',
        params,
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-${new Date().toISOString().slice(0, 10)}.pdf"`);
      res.send(buf);
    }
  }
}

