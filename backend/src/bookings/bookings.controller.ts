import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CreatePaymentDto, UpdateBookingDto } from './dto/booking.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'roomId', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('roomId') roomId?: string,
    @Query('customerId') customerId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.bookings.findAll({
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      status,
      roomId,
      customerId,
      dateFrom,
      dateTo,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookings.findById(id);
  }

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookings.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookings.update(id, dto);
  }

  @Post(':id/check-in')
  @ApiOperation({ summary: 'Check a guest in' })
  checkIn(@Param('id') id: string) {
    return this.bookings.checkIn(id);
  }

  @Post(':id/check-out')
  @ApiOperation({ summary: 'Check a guest out' })
  checkOut(@Param('id') id: string) {
    return this.bookings.checkOut(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking (soft cancel)' })
  cancel(@Param('id') id: string) {
    return this.bookings.cancel(id);
  }

  @Get(':id/payments')
  listPayments(@Param('id') id: string) {
    return this.bookings.listPayments(id);
  }

  @Post(':id/payments')
  addPayment(@Param('id') id: string, @Body() dto: CreatePaymentDto) {
    return this.bookings.addPayment(id, dto);
  }
}
