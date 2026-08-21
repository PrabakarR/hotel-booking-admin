import { Module, forwardRef } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { CustomersModule } from '../customers/customers.module';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [forwardRef(() => CustomersModule), RoomsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
