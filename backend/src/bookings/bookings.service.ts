import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Booking,
  BookingStatus,
  Customer,
  Payment,
  Prisma,
  Room,
  RoomStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, CreatePaymentDto, UpdateBookingDto } from './dto/booking.dto';
import {
  bookingTotals,
  formatHotelDate,
  kolkataDateParts,
  mapBookingStatus,
  mapPaymentMode,
  mapRoomStatus,
  mapRoomType,
  paginated,
  parseBookingStatus,
  parseHotelDate,
  parsePaymentMode,
  toNumber,
} from '../common/utils/mappers';
import { CustomersService } from '../customers/customers.service';
import { RoomsService } from '../rooms/rooms.service';

type BookingRecord = Booking & {
  customer: Customer;
  room: Room;
  payments?: Payment[];
};

const ACTIVE_STATUSES: BookingStatus[] = [BookingStatus.BOOKED, BookingStatus.CHECKED_IN];

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customers: CustomersService,
    private readonly rooms: RoomsService,
  ) {}

  async findAll(query: {
    search?: string;
    page?: number;
    pageSize?: number;
    limit?: number;
    status?: string;
    roomId?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.pageSize ?? query.limit) || 20);
    const search = query.search?.trim();

    const where: Prisma.BookingWhereInput = {};
    if (query.status && query.status !== 'all') {
      where.status = parseBookingStatus(query.status);
    }
    if (query.roomId) where.roomId = query.roomId;
    if (query.customerId) where.customerId = query.customerId;
    if (query.dateFrom) where.checkIn = { gte: parseHotelDate(query.dateFrom) };
    if (query.dateTo) {
      where.checkOut = {
        ...(typeof where.checkOut === 'object' ? where.checkOut : {}),
        lte: parseHotelDate(query.dateTo),
      };
    }
    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { mobile: { contains: search, mode: 'insensitive' } } },
        { room: { roomNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, bookings] = await this.prisma.$transaction([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        include: { customer: true, room: true, payments: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return paginated(
      bookings.map((booking) => this.serialize(booking)),
      total,
      page,
      limit,
    );
  }

  async findById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { customer: true, room: true, payments: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return this.serialize(booking);
  }

  async findByCustomerId(customerId: string) {
    await this.customers.findById(customerId);
    const bookings = await this.prisma.booking.findMany({
      where: { customerId },
      include: { customer: true, room: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
    return bookings.map((booking) => this.serialize(booking));
  }

  async create(dto: CreateBookingDto) {
    const checkIn = parseHotelDate(dto.checkIn);
    const checkOut = parseHotelDate(dto.checkOut);
    if (checkOut <= checkIn) {
      throw new BadRequestException('Check-out must be after check-in');
    }

    const rent = dto.price;
    const discount = dto.discount ?? 0;
    const gst = dto.gst ?? 0;
    const advance = dto.advance ?? 0;
    const { totalAmount, balanceAmount } = bookingTotals({
      rent,
      discount,
      gst,
      advance,
    });
    const requestedStatus = dto.status
      ? parseBookingStatus(dto.status)
      : BookingStatus.BOOKED;

    return this.prisma.$transaction(async (tx) => {
      await this.lockRoom(tx, dto.roomId);
      const room = await tx.room.findUnique({ where: { id: dto.roomId } });
      if (!room) throw new NotFoundException('Room not found');
      const customer = await tx.customer.findUnique({ where: { id: dto.customerId } });
      if (!customer) throw new NotFoundException('Customer not found');

      await this.assertNoOverlap(tx, dto.roomId, checkIn, checkOut);

      if (requestedStatus === BookingStatus.CHECKED_IN && room.status === RoomStatus.OCCUPIED) {
        throw new ConflictException(`Room ${room.roomNumber} is already occupied`);
      }

      const bookingNumber = await this.nextBookingNumber(tx);
      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId: dto.customerId,
          roomId: dto.roomId,
          checkIn,
          checkOut,
          adults: dto.adults,
          children: dto.children ?? 0,
          rent,
          discount,
          gst,
          totalAmount,
          advanceAmount: advance,
          balanceAmount,
          paymentMode: parsePaymentMode(dto.paymentMethod),
          status: requestedStatus,
          notes: dto.notes ?? null,
        },
        include: { customer: true, room: true, payments: true },
      });

      if (advance > 0) {
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: advance,
            paymentMode: parsePaymentMode(dto.paymentMethod),
            notes: 'Initial advance',
          },
        });
      }

      if (requestedStatus === BookingStatus.CHECKED_IN) {
        await tx.room.update({
          where: { id: room.id },
          data: { status: RoomStatus.OCCUPIED },
        });
      }

      const full = await tx.booking.findUniqueOrThrow({
        where: { id: booking.id },
        include: { customer: true, room: true, payments: true },
      });
      return this.serialize(full);
    });
  }

  async update(id: string, dto: UpdateBookingDto) {
    const current = await this.prisma.booking.findUnique({
      where: { id },
      include: { customer: true, room: true, payments: true },
    });
    if (!current) throw new NotFoundException('Booking not found');

    if (dto.status === 'checked_in' && current.status === BookingStatus.BOOKED) {
      return this.checkIn(id);
    }
    if (dto.status === 'checked_out' && current.status === BookingStatus.CHECKED_IN) {
      return this.checkOut(id);
    }
    if (dto.status === 'cancelled' && current.status !== BookingStatus.CANCELLED) {
      return this.cancel(id);
    }

    const roomId = dto.roomId ?? current.roomId;
    const checkIn = dto.checkIn ? parseHotelDate(dto.checkIn) : current.checkIn;
    const checkOut = dto.checkOut ? parseHotelDate(dto.checkOut) : current.checkOut;
    if (checkOut <= checkIn) {
      throw new BadRequestException('Check-out must be after check-in');
    }

    const rent = dto.price ?? toNumber(current.rent);
    const discount = dto.discount ?? toNumber(current.discount);
    const gst = dto.gst ?? toNumber(current.gst);
    const advance = dto.advance ?? toNumber(current.advanceAmount);
    const { totalAmount, balanceAmount } = bookingTotals({
      rent,
      discount,
      gst,
      advance,
    });

    return this.prisma.$transaction(async (tx) => {
      await this.lockRoom(tx, roomId);
      await this.assertNoOverlap(tx, roomId, checkIn, checkOut, id);

      const booking = await tx.booking.update({
        where: { id },
        data: {
          customerId: dto.customerId,
          roomId,
          checkIn,
          checkOut,
          adults: dto.adults,
          children: dto.children,
          rent,
          discount,
          gst,
          totalAmount,
          advanceAmount: advance,
          balanceAmount,
          paymentMode: dto.paymentMethod
            ? parsePaymentMode(dto.paymentMethod)
            : undefined,
          notes: dto.notes,
          status: dto.status ? parseBookingStatus(dto.status) : undefined,
        },
        include: { customer: true, room: true, payments: true },
      });
      return this.serialize(booking);
    });
  }

  async checkIn(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        include: { customer: true, room: true, payments: true },
      });
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('Cannot check in a cancelled booking');
      }
      if (booking.status === BookingStatus.CHECKED_OUT) {
        throw new BadRequestException('Cannot check in a completed booking');
      }
      if (booking.status === BookingStatus.CHECKED_IN) {
        return this.serialize(booking);
      }

      await this.lockRoom(tx, booking.roomId);
      const room = await tx.room.findUnique({ where: { id: booking.roomId } });
      if (!room) throw new NotFoundException('Room not found');
      if (room.status === RoomStatus.OCCUPIED) {
        throw new ConflictException(`Room ${room.roomNumber} is already occupied`);
      }

      const [updated] = await Promise.all([
        tx.booking.update({
          where: { id },
          data: { status: BookingStatus.CHECKED_IN },
          include: { customer: true, room: true, payments: true },
        }),
        tx.room.update({
          where: { id: room.id },
          data: { status: RoomStatus.OCCUPIED },
        }),
      ]);

      return this.serialize({ ...updated, room: { ...room, status: RoomStatus.OCCUPIED } });
    });
  }

  async checkOut(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        include: { customer: true, room: true, payments: true },
      });
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.status !== BookingStatus.CHECKED_IN) {
        throw new BadRequestException('Only checked-in bookings can be checked out');
      }

      const remaining = toNumber(booking.balanceAmount);
      if (remaining > 0) {
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount: remaining,
            paymentMode: booking.paymentMode,
            notes: 'Balance settled at checkout',
          },
        });
      }

      const [updated] = await Promise.all([
        tx.booking.update({
          where: { id },
          data: {
            status: BookingStatus.CHECKED_OUT,
            advanceAmount: toNumber(booking.totalAmount),
            balanceAmount: 0,
          },
          include: { customer: true, room: true, payments: true },
        }),
        tx.room.update({
          where: { id: booking.roomId },
          data: { status: RoomStatus.CLEANING },
        }),
      ]);

      return this.serialize({
        ...updated,
        room: { ...booking.room, status: RoomStatus.CLEANING },
      });
    });
  }

  async cancel(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        include: { customer: true, room: true, payments: true },
      });
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.status === BookingStatus.CANCELLED) {
        return this.serialize(booking);
      }
      if (booking.status === BookingStatus.CHECKED_OUT) {
        throw new BadRequestException('Cannot cancel a checked-out booking');
      }

      const wasOccupying = booking.status === BookingStatus.CHECKED_IN;
      const updated = await tx.booking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED },
        include: { customer: true, room: true, payments: true },
      });

      if (wasOccupying) {
        await tx.room.update({
          where: { id: booking.roomId },
          data: { status: RoomStatus.AVAILABLE },
        });
      }

      return this.serialize({
        ...updated,
        room: wasOccupying
          ? { ...booking.room, status: RoomStatus.AVAILABLE }
          : booking.room,
      });
    });
  }

  async listPayments(bookingId: string) {
    await this.findById(bookingId);
    const payments = await this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
    return payments.map((payment) => this.serializePayment(payment));
  }

  async addPayment(bookingId: string, dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('Cannot add a payment to a cancelled booking');
      }

      await tx.payment.create({
        data: {
          bookingId,
          amount: dto.amount,
          paymentMode: parsePaymentMode(dto.paymentMode),
          transactionReference: dto.transactionReference,
          notes: dto.notes,
        },
      });

      const paid = await tx.payment.aggregate({
        where: { bookingId },
        _sum: { amount: true },
      });
      const advanceAmount = toNumber(paid._sum.amount ?? 0);
      const balanceAmount = Math.max(0, toNumber(booking.totalAmount) - advanceAmount);

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { advanceAmount, balanceAmount },
        include: { customer: true, room: true, payments: true },
      });
      return this.serialize(updated);
    });
  }

  async assertNoOverlap(
    tx: Prisma.TransactionClient,
    roomId: string,
    checkIn: Date,
    checkOut: Date,
    excludeId?: string,
  ) {
    const overlap = await tx.booking.findFirst({
      where: {
        roomId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { in: ACTIVE_STATUSES },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      include: { room: true },
    });

    if (overlap) {
      throw new ConflictException(
        `Room ${overlap.room.roomNumber} is already booked for the selected dates`,
      );
    }
  }

  private async lockRoom(tx: Prisma.TransactionClient, roomId: string) {
    await tx.$queryRaw`SELECT id FROM "Room" WHERE id = ${roomId}::uuid FOR UPDATE`;
  }

  private async nextBookingNumber(tx: Prisma.TransactionClient) {
    const { year, month, day } = kolkataDateParts();
    const prefix = `BK-${year}${month}${day}-`;
    const last = await tx.booking.findFirst({
      where: { bookingNumber: { startsWith: prefix } },
      orderBy: { bookingNumber: 'desc' },
    });
    const seq = last ? Number(last.bookingNumber.slice(-4)) + 1 : 1;
    return `${prefix}${String(seq).padStart(4, '0')}`;
  }

  serialize(booking: BookingRecord) {
    const customer = this.customers.serialize(booking.customer);
    const room = this.rooms.serialize(booking.room);
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      customerId: booking.customerId,
      roomId: booking.roomId,
      checkIn: formatHotelDate(booking.checkIn),
      checkOut: formatHotelDate(booking.checkOut),
      adults: booking.adults,
      children: booking.children,
      price: toNumber(booking.rent),
      rent: toNumber(booking.rent),
      discount: toNumber(booking.discount),
      gst: toNumber(booking.gst),
      totalAmount: toNumber(booking.totalAmount),
      advance: toNumber(booking.advanceAmount),
      advanceAmount: toNumber(booking.advanceAmount),
      balance: toNumber(booking.balanceAmount),
      balanceAmount: toNumber(booking.balanceAmount),
      paymentMethod: mapPaymentMode(booking.paymentMode),
      paymentMode: mapPaymentMode(booking.paymentMode),
      notes: booking.notes ?? '',
      status: mapBookingStatus(booking.status),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      customer,
      room,
      payments: (booking.payments ?? []).map((payment) => this.serializePayment(payment)),
    };
  }

  serializePayment(payment: Payment) {
    return {
      id: payment.id,
      bookingId: payment.bookingId,
      amount: toNumber(payment.amount),
      paymentMode: mapPaymentMode(payment.paymentMode),
      paymentMethod: mapPaymentMode(payment.paymentMode),
      transactionReference: payment.transactionReference ?? undefined,
      notes: payment.notes ?? undefined,
      createdAt: payment.createdAt.toISOString(),
    };
  }
}
