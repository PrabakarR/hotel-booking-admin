import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  summary() {
    return this.dashboard.summary();
  }

  @Get('recent-bookings')
  recent() {
    return this.dashboard.recentBookings();
  }

  @Get('upcoming-checkouts')
  upcoming() {
    return this.dashboard.upcomingCheckouts();
  }

  @Get('occupancy-series')
  occupancy() {
    return this.dashboard.occupancySeries();
  }

  @Get('monthly-revenue')
  monthly() {
    return this.dashboard.monthlyRevenue();
  }
}
