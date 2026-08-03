import { format, parseISO } from "date-fns";
import { delay, mockStore } from "@/mock/store";
import type {
  BookingStatistics,
  DailyRevenueRow,
  MonthlyRevenueRow,
  ReportsData,
  RoomOccupancyRow,
  TopCustomerRow,
} from "@/types";
import { nightsBetween } from "@/lib/format";

function bookingTotal(booking: (typeof mockStore.bookings)[number]) {
  return booking.price - booking.discount + booking.gst;
}

export const reportsService = {
  async getReports(): Promise<ReportsData> {
    await delay(400);
    const active = mockStore.bookings.filter((b) => b.status !== "cancelled");

    const dailyMap = new Map<string, DailyRevenueRow>();
    for (const booking of active) {
      const existing = dailyMap.get(booking.checkIn) ?? {
        date: booking.checkIn,
        bookings: 0,
        revenue: 0,
      };
      existing.bookings += 1;
      existing.revenue += bookingTotal(booking);
      dailyMap.set(booking.checkIn, existing);
    }
    const dailyRevenue = [...dailyMap.values()]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14);

    const monthlyMap = new Map<string, MonthlyRevenueRow>();
    for (const booking of active) {
      const month = format(parseISO(booking.checkIn), "MMM yyyy");
      const existing = monthlyMap.get(month) ?? {
        month,
        bookings: 0,
        revenue: 0,
      };
      existing.bookings += 1;
      existing.revenue += bookingTotal(booking);
      monthlyMap.set(month, existing);
    }
    const monthlyRevenue = [...monthlyMap.values()];

    const roomOccupancy: RoomOccupancyRow[] = mockStore.rooms.map((room) => {
      const roomBookings = active.filter((b) => b.roomId === room.id);
      const occupiedNights = roomBookings.reduce(
        (sum, b) => sum + nightsBetween(b.checkIn, b.checkOut),
        0
      );
      const revenue = roomBookings.reduce((sum, b) => sum + bookingTotal(b), 0);
      return {
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        occupiedNights,
        occupancyRate: Math.min(100, Math.round((occupiedNights / 90) * 100)),
        revenue,
      };
    });

    const customerMap = new Map<string, TopCustomerRow>();
    for (const booking of active) {
      const customer = mockStore.customers.find((c) => c.id === booking.customerId);
      if (!customer) continue;
      const existing = customerMap.get(customer.id) ?? {
        customerId: customer.id,
        name: customer.name,
        phone: customer.phone,
        bookings: 0,
        totalSpent: 0,
      };
      existing.bookings += 1;
      existing.totalSpent += bookingTotal(booking);
      customerMap.set(customer.id, existing);
    }
    const topCustomers = [...customerMap.values()]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const totalNights = active.reduce(
      (sum, b) => sum + nightsBetween(b.checkIn, b.checkOut),
      0
    );
    const bookingStatistics: BookingStatistics = {
      total: mockStore.bookings.length,
      booked: mockStore.bookings.filter((b) => b.status === "booked").length,
      checkedIn: mockStore.bookings.filter((b) => b.status === "checked_in").length,
      checkedOut: mockStore.bookings.filter((b) => b.status === "checked_out").length,
      cancelled: mockStore.bookings.filter((b) => b.status === "cancelled").length,
      averageStayNights: active.length ? totalNights / active.length : 0,
      averageBookingValue: active.length
        ? active.reduce((sum, b) => sum + bookingTotal(b), 0) / active.length
        : 0,
    };

    return {
      dailyRevenue,
      monthlyRevenue,
      roomOccupancy,
      topCustomers,
      bookingStatistics,
    };
  },
};
