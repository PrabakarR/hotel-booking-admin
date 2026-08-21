import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  formatHotelDate,
  mapRoomType,
  nightsBetween,
  parseHotelDate,
  toNumber,
  todayInKolkata,
} from '../common/utils/mappers';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private range(from?: string, to?: string) {
    const end = to ? parseHotelDate(to) : parseHotelDate(todayInKolkata());
    const start = from
      ? parseHotelDate(from)
      : new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
    return { start, end };
  }

  async overview(from?: string, to?: string) {
    const { start, end } = this.range(from, to);
    const endInclusive = new Date(end);
    endInclusive.setUTCDate(endInclusive.getUTCDate() + 1);

    const where = {
      checkIn: { gte: start, lt: endInclusive },
    };

    const bookings = await this.prisma.booking.findMany({
      where,
      include: { customer: true, room: true },
    });

    const active = bookings.filter((b) => b.status !== BookingStatus.CANCELLED);
    const sum = (list: typeof bookings, field: 'totalAmount' | 'advanceAmount' | 'balanceAmount') =>
      list.reduce((acc, b) => acc + toNumber(b[field]), 0);

    return {
      from: formatHotelDate(start),
      to: formatHotelDate(end),
      totalBookings: bookings.length,
      totalRevenue: sum(active, 'totalAmount'),
      totalAdvance: sum(active, 'advanceAmount'),
      totalBalance: sum(active, 'balanceAmount'),
      cancelledBookings: bookings.filter((b) => b.status === BookingStatus.CANCELLED).length,
      checkedInBookings: bookings.filter((b) => b.status === BookingStatus.CHECKED_IN).length,
      checkedOutBookings: bookings.filter((b) => b.status === BookingStatus.CHECKED_OUT).length,
    };
  }

  async daily(from?: string, to?: string) {
    const { start, end } = this.range(from, to);
    const endInclusive = new Date(end);
    endInclusive.setUTCDate(endInclusive.getUTCDate() + 1);
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: { not: BookingStatus.CANCELLED },
        checkIn: { gte: start, lt: endInclusive },
      },
    });

    const map = new Map<string, { date: string; bookings: number; revenue: number }>();
    for (const booking of bookings) {
      const date = formatHotelDate(booking.checkIn);
      const row = map.get(date) ?? { date, bookings: 0, revenue: 0 };
      row.bookings += 1;
      row.revenue += toNumber(booking.totalAmount);
      map.set(date, row);
    }
    return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
  }

  async monthly(from?: string, to?: string) {
    const daily = await this.daily(from, to);
    const map = new Map<string, { month: string; bookings: number; revenue: number }>();
    for (const row of daily) {
      const month = new Date(`${row.date}T00:00:00.000Z`).toLocaleString('en-IN', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      });
      const existing = map.get(month) ?? { month, bookings: 0, revenue: 0 };
      existing.bookings += row.bookings;
      existing.revenue += row.revenue;
      map.set(month, existing);
    }
    return [...map.values()];
  }

  async occupancy(from?: string, to?: string) {
    const { start, end } = this.range(from, to);
    const windowDays = Math.max(1, nightsBetween(start, new Date(end.getTime() + 86400000)));
    const rooms = await this.prisma.room.findMany({ orderBy: { roomNumber: 'asc' } });
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: { not: BookingStatus.CANCELLED },
        checkIn: { lt: new Date(end.getTime() + 86400000) },
        checkOut: { gt: start },
      },
    });

    return rooms.map((room) => {
      const roomBookings = bookings.filter((b) => b.roomId === room.id);
      const occupiedNights = roomBookings.reduce(
        (sum, b) => sum + nightsBetween(b.checkIn, b.checkOut),
        0,
      );
      const revenue = roomBookings.reduce((sum, b) => sum + toNumber(b.totalAmount), 0);
      return {
        roomNumber: room.roomNumber,
        roomType: mapRoomType(room.roomType),
        occupiedNights,
        occupancyRate: Math.min(100, Math.round((occupiedNights / windowDays) * 100)),
        revenue,
      };
    });
  }

  async frontendBundle(from?: string, to?: string) {
    const [dailyRevenue, monthlyRevenue, roomOccupancy, overview] = await Promise.all([
      this.daily(from, to),
      this.monthly(from, to),
      this.occupancy(from, to),
      this.overview(from, to),
    ]);

    const bookings = await this.prisma.booking.findMany({
      include: { customer: true },
    });
    const active = bookings.filter((b) => b.status !== BookingStatus.CANCELLED);

    const customerMap = new Map<
      string,
      { customerId: string; name: string; phone: string; bookings: number; totalSpent: number }
    >();
    for (const booking of active) {
      const existing = customerMap.get(booking.customerId) ?? {
        customerId: booking.customerId,
        name: booking.customer.name,
        phone: booking.customer.mobile,
        bookings: 0,
        totalSpent: 0,
      };
      existing.bookings += 1;
      existing.totalSpent += toNumber(booking.totalAmount);
      customerMap.set(booking.customerId, existing);
    }

    const totalNights = active.reduce(
      (sum, b) => sum + nightsBetween(b.checkIn, b.checkOut),
      0,
    );

    return {
      dailyRevenue: dailyRevenue.slice(0, 14),
      monthlyRevenue,
      roomOccupancy,
      topCustomers: [...customerMap.values()]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10),
      bookingStatistics: {
        total: bookings.length,
        booked: bookings.filter((b) => b.status === BookingStatus.BOOKED).length,
        checkedIn: bookings.filter((b) => b.status === BookingStatus.CHECKED_IN).length,
        checkedOut: bookings.filter((b) => b.status === BookingStatus.CHECKED_OUT).length,
        cancelled: bookings.filter((b) => b.status === BookingStatus.CANCELLED).length,
        averageStayNights: active.length ? totalNights / active.length : 0,
        averageBookingValue: active.length
          ? active.reduce((sum, b) => sum + toNumber(b.totalAmount), 0) / active.length
          : 0,
      },
      overview,
    };
  }
}
