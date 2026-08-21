import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  bundle(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.frontendBundle(from, to);
  }

  @Get('daily')
  daily(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.daily(from, to);
  }

  @Get('monthly')
  monthly(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.monthly(from, to);
  }

  @Get('revenue')
  revenue(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.overview(from, to);
  }

  @Get('occupancy')
  occupancy(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.occupancy(from, to);
  }
}
