import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsService } from './bookings.service';
import { CustomersService } from '../customers/customers.service';
import { RoomsService } from '../rooms/rooms.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { BookingStatus, PaymentMode, Role, RoomStatus, RoomType } from '@prisma/client';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

function room(overrides: Partial<{ id: string; roomNumber: string; status: RoomStatus }> = {}) {
  return {
    id: 'room-1',
    roomNumber: '101',
    floor: 1,
    roomType: RoomType.DELUXE,
    capacity: 2,
    price: 3500,
    status: RoomStatus.AVAILABLE,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function customer() {
  return {
    id: 'cust-1',
    name: 'Aarav Kumar',
    mobile: '+919000000137',
    email: 'aarav@email.com',
    address: 'Pune',
    idProofType: 'AADHAR',
    idProofNumber: 'AADHAR-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function booking(overrides: Record<string, unknown> = {}) {
  return {
    id: 'book-1',
    bookingNumber: 'BK-20260821-0001',
    customerId: 'cust-1',
    roomId: 'room-1',
    checkIn: new Date(Date.UTC(2026, 7, 21)),
    checkOut: new Date(Date.UTC(2026, 7, 23)),
    adults: 2,
    children: 0,
    rent: 7000,
    discount: 0,
    gst: 840,
    totalAmount: 7840,
    advanceAmount: 2000,
    balanceAmount: 5840,
    paymentMode: PaymentMode.UPI,
    status: BookingStatus.BOOKED,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: customer(),
    room: room(),
    payments: [],
    ...overrides,
  };
}

describe('AuthService', () => {
  const prisma = { user: { findUnique: jest.fn() } } as unknown as PrismaService;
  const jwt = { signAsync: jest.fn().mockResolvedValue('jwt-token') } as unknown as JwtService;
  const service = new AuthService(prisma, jwt);

  it('logs in with valid credentials', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      name: 'Admin',
      email: 'admin@hotel.com',
      password: 'hashed',
      role: Role.ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login({ email: 'admin@hotel.com', password: 'password123' });
    expect(result.token).toBe('jwt-token');
    expect(result.user.email).toBe('admin@hotel.com');
    expect(result.user).not.toHaveProperty('password');
  });

  it('rejects invalid passwords', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'admin@hotel.com',
      password: 'hashed',
      isActive: true,
      role: Role.ADMIN,
      name: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ email: 'admin@hotel.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('RoomsService.create', () => {
  it('creates a room when the number is unique', async () => {
    const prisma = {
      room: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(room()),
      },
    } as unknown as PrismaService;
    const service = new RoomsService(prisma);
    const created = await service.create({
      roomNumber: '101',
      floor: 1,
      roomType: 'Deluxe',
      capacity: 2,
      price: 3500,
    });
    expect(created.roomNumber).toBe('101');
    expect(created.status).toBe('available');
  });
});

describe('CustomersService.create', () => {
  it('creates a customer mapped to frontend phone/idProof fields', async () => {
    const prisma = {
      customer: {
        create: jest.fn().mockResolvedValue(customer()),
      },
    } as unknown as PrismaService;
    const service = new CustomersService(prisma);
    const created = await service.create({
      name: 'Aarav Kumar',
      phone: '+919000000137',
      email: 'aarav@email.com',
      idProof: 'AADHAR-1',
      address: 'Pune',
    });
    expect(created.phone).toBe('+919000000137');
    expect(created.idProof).toBe('AADHAR-1');
  });
});

describe('BookingsService', () => {
  function makeService(overlap: unknown = null, extras: Record<string, unknown> = {}) {
    const tx = {
      $queryRaw: jest.fn(),
      room: {
        findUnique: jest.fn().mockResolvedValue(room()),
        update: jest.fn().mockResolvedValue(room({ status: RoomStatus.OCCUPIED })),
      },
      customer: { findUnique: jest.fn().mockResolvedValue(customer()) },
      booking: {
        findFirst: jest.fn().mockResolvedValue(overlap),
        findUnique: jest.fn().mockResolvedValue(booking()),
        findUniqueOrThrow: jest.fn().mockResolvedValue(booking()),
        create: jest.fn().mockResolvedValue(booking()),
        update: jest.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) =>
          Promise.resolve(booking(data)),
        ),
      },
      payment: {
        create: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 3000 } }),
      },
      ...extras,
    };

    const prisma = {
      $transaction: jest.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
      booking: {
        findUnique: jest.fn().mockResolvedValue(booking()),
      },
    } as unknown as PrismaService;

    const customers = new CustomersService(prisma);
    const rooms = new RoomsService(prisma);
    const service = new BookingsService(prisma, customers, rooms);
    return { service, tx, prisma };
  }

  it('creates a booking when the room is free', async () => {
    const { service } = makeService(null);
    const created = await service.create({
      customerId: 'cust-1',
      roomId: 'room-1',
      checkIn: '2026-08-21',
      checkOut: '2026-08-23',
      adults: 2,
      children: 0,
      price: 7000,
      discount: 0,
      gst: 840,
      advance: 2000,
      paymentMethod: 'upi',
    });
    expect(created.bookingNumber).toBeDefined();
    expect(created.status).toBe('booked');
  });

  it('rejects overlapping bookings with HTTP 409 semantics', async () => {
    const { service } = makeService(booking({ room: room() }));
    await expect(
      service.create({
        customerId: 'cust-1',
        roomId: 'room-1',
        checkIn: '2026-08-22',
        checkOut: '2026-08-24',
        adults: 1,
        price: 3500,
        paymentMethod: 'cash',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('checks a guest in and occupies the room', async () => {
    const { service, tx } = makeService();
    (tx.booking.findUnique as jest.Mock).mockResolvedValue(booking({ status: BookingStatus.BOOKED }));
    const result = await service.checkIn('book-1');
    expect(tx.room.update).toHaveBeenCalled();
    expect(result.status).toBe('checked_in');
  });

  it('checks a guest out and marks the room cleaning', async () => {
    const { service, tx } = makeService();
    (tx.booking.findUnique as jest.Mock).mockResolvedValue(
      booking({ status: BookingStatus.CHECKED_IN, balanceAmount: 1000 }),
    );
    const result = await service.checkOut('book-1');
    expect(tx.payment.create).toHaveBeenCalled();
    expect(result.status).toBe('checked_out');
  });

  it('cancels a booking without deleting it', async () => {
    const { service, tx } = makeService();
    (tx.booking.findUnique as jest.Mock).mockResolvedValue(booking({ status: BookingStatus.BOOKED }));
    const result = await service.cancel('book-1');
    expect(result.status).toBe('cancelled');
    expect(tx.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: BookingStatus.CANCELLED } }),
    );
  });

  it('adds a payment and recalculates the outstanding balance', async () => {
    const { service, tx } = makeService();
    (tx.booking.findUnique as jest.Mock).mockResolvedValue(booking());
    (tx.booking.update as jest.Mock).mockResolvedValue(
      booking({ advanceAmount: 3000, balanceAmount: 4840, payments: [] }),
    );
    const result = await service.addPayment('book-1', {
      amount: 1000,
      paymentMode: 'upi',
    });
    expect(tx.payment.create).toHaveBeenCalled();
    expect(result.advance).toBe(3000);
  });
});

describe('DashboardService.summary', () => {
  it('returns occupancy and today counters from the database', async () => {
    const prisma = {
      room: {
        findMany: jest.fn().mockResolvedValue([
          room(),
          room({ id: 'r2', status: RoomStatus.OCCUPIED }),
        ]),
      },
      booking: {
        count: jest.fn().mockResolvedValue(1),
        aggregate: jest.fn().mockResolvedValue({ _sum: { totalAmount: 5000 } }),
      },
    } as unknown as PrismaService;
    const service = new DashboardService(prisma);
    const summary = await service.summary();
    expect(summary.totalRooms).toBe(2);
    expect(summary.occupiedRooms).toBe(1);
    expect(summary.todaysRevenue).toBe(5000);
  });
});
