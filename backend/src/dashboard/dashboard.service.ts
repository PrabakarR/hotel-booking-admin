import { Injectable } from '@nestjs/common';
import { BookingStatus, RoomStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  formatHotelDate,
  mapBookingStatus,
  parseHotelDate,
  toNumber,
  todayInKolkata,
} from '../common/utils/mappers';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const today = todayInKolkata();
    const todayDate = parseHotelDate(today);

    const [
      rooms,
      todayCheckIns,
      todayCheckOuts,
      todayBookings,
      todayRevenueAgg,
    ] = await Promise.all([
      this.prisma.room.findMany(),
      this.prisma.booking.count({
        where: {
          checkIn: todayDate,
          status: { not: BookingStatus.CANCELLED },
        },
      }),
      this.prisma.booking.count({
        where: {
          checkOut: todayDate,
          status: { not: BookingStatus.CANCELLED },
        },
      }),
      this.prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(`${today}T00:00:00.000+05:30`),
            lt: new Date(`${today}T23:59:59.999+05:30`),
          },
        },
      }),
      this.prisma.booking.aggregate({
        where: {
          checkIn: todayDate,
          status: { not: BookingStatus.CANCELLED },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length;
    const occupiedRooms = rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length;
    const cleaningRooms = rooms.filter((r) => r.status === RoomStatus.CLEANING).length;
    const maintenanceRooms = rooms.filter((r) => r.status === RoomStatus.MAINTENANCE).length;
    const todaysRevenue = toNumber(todayRevenueAgg._sum.totalAmount ?? 0);

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      cleaningRooms,
      maintenanceRooms,
      todayCheckIns,
      todayCheckOuts,
      todayBookings,
      todayRevenue: todaysRevenue,
      todaysCheckIn: todayCheckIns,
      todaysCheckOut: todayCheckOuts,
      todaysRevenue,
      occupancyRate: totalRooms ? (occupiedRooms / totalRooms) * 100 : 0,
    };
  }

  async recentBookings() {
    const bookings = await this.prisma.booking.findMany({
      include: { customer: true, room: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    return bookings.map((booking) => ({
      id: booking.id,
      customerName: booking.customer.name,
      roomNumber: booking.room.roomNumber,
      checkIn: formatHotelDate(booking.checkIn),
      checkOut: formatHotelDate(booking.checkOut),
      status: mapBookingStatus(booking.status),
      amount: toNumber(booking.totalAmount),
    }));
  }

  async upcomingCheckouts() {
    const today = parseHotelDate(todayInKolkata());
    const weekAhead = new Date(today);
    weekAhead.setUTCDate(weekAhead.getUTCDate() + 5);

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.CHECKED_IN,
        checkOut: { gte: today, lte: weekAhead },
      },
      include: { customer: true, room: true },
      orderBy: { checkOut: 'asc' },
      take: 6,
    });

    return bookings.map((booking) => ({
      id: booking.id,
      customerName: booking.customer.name,
      roomNumber: booking.room.roomNumber,
      checkOut: formatHotelDate(booking.checkOut),
      balance: toNumber(booking.balanceAmount),
    }));
  }

  async occupancySeries() {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = parseHotelDate(todayInKolkata());
    const weekday = today.getUTCDay();
    const mondayOffset = (weekday + 6) % 7;
    const monday = new Date(today);
    monday.setUTCDate(monday.getUTCDate() - mondayOffset);

    const totalRooms = await this.prisma.room.count();
    const points = [];

    for (let i = 0; i < 7; i += 1) {
      const day = new Date(monday);
      day.setUTCDate(monday.getUTCDate() + i);
      const next = new Date(day);
      next.setUTCDate(day.getUTCDate() + 1);

      const occupied = await this.prisma.booking.count({
        where: {
          status: { in: [BookingStatus.BOOKED, BookingStatus.CHECKED_IN] },
          checkIn: { lt: next },
          checkOut: { gt: day },
        },
      });

      points.push({
        label: labels[i],
        rate: totalRooms ? Math.round((occupied / totalRooms) * 100) : 0,
      });
    }

    return points;
  }

  async monthlyRevenue() {
    const today = parseHotelDate(todayInKolkata());
    const points = [];

    for (let i = 5; i >= 0; i -= 1) {
      const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
      const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
      const label = start.toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' });

      const agg = await this.prisma.booking.aggregate({
        where: {
          status: { not: BookingStatus.CANCELLED },
          checkIn: { gte: start, lt: end },
        },
        _sum: { totalAmount: true },
      });

      points.push({
        label,
        revenue: toNumber(agg._sum.totalAmount ?? 0),
      });
    }

    return points;
  }
}
