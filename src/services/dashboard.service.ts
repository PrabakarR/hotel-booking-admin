import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import { delay, mockStore } from "@/mock/store";
import type {
  DashboardStats,
  OccupancyPoint,
  RecentBookingRow,
  RevenuePoint,
  UpcomingCheckout,
} from "@/types";

const TODAY = "2026-08-03";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    await delay();
    const rooms = mockStore.rooms;
    const bookings = mockStore.bookings;

    const todaysCheckIn = bookings.filter(
      (b) => b.checkIn === TODAY && b.status !== "cancelled"
    ).length;
    const todaysCheckOut = bookings.filter(
      (b) => b.checkOut === TODAY && b.status !== "cancelled"
    ).length;
    const todaysRevenue = bookings
      .filter(
        (b) =>
          b.checkIn === TODAY &&
          (b.status === "checked_in" || b.status === "checked_out" || b.status === "booked")
      )
      .reduce((sum, b) => sum + (b.price - b.discount + b.gst), 0);

    const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
    const availableRooms = rooms.filter((r) => r.status === "available").length;

    return {
      totalRooms: rooms.length,
      availableRooms,
      occupiedRooms,
      todaysCheckIn,
      todaysCheckOut,
      todaysRevenue,
      occupancyRate: rooms.length ? (occupiedRooms / rooms.length) * 100 : 0,
    };
  },

  async getRecentBookings(): Promise<RecentBookingRow[]> {
    await delay(250);
    return [...mockStore.bookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((booking) => {
        const customer = mockStore.customers.find((c) => c.id === booking.customerId);
        const room = mockStore.rooms.find((r) => r.id === booking.roomId);
        return {
          id: booking.id,
          customerName: customer?.name ?? "Unknown",
          roomNumber: room?.roomNumber ?? "-",
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          status: booking.status,
          amount: booking.price - booking.discount + booking.gst,
        };
      });
  },

  async getUpcomingCheckouts(): Promise<UpcomingCheckout[]> {
    await delay(250);
    return mockStore.bookings
      .filter(
        (b) =>
          b.status === "checked_in" &&
          b.checkOut >= TODAY &&
          b.checkOut <= "2026-08-07"
      )
      .sort((a, b) => a.checkOut.localeCompare(b.checkOut))
      .slice(0, 6)
      .map((booking) => {
        const customer = mockStore.customers.find((c) => c.id === booking.customerId);
        const room = mockStore.rooms.find((r) => r.id === booking.roomId);
        return {
          id: booking.id,
          customerName: customer?.name ?? "Unknown",
          roomNumber: room?.roomNumber ?? "-",
          checkOut: booking.checkOut,
          balance: booking.balance,
        };
      });
  },

  async getOccupancySeries(): Promise<OccupancyPoint[]> {
    await delay(200);
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const base = mockStore.rooms.filter((r) => r.status === "occupied").length;
    return labels.map((label, index) => ({
      label,
      rate: Math.min(
        100,
        Math.round(((base + ((index * 3) % 5) - 1) / mockStore.rooms.length) * 100)
      ),
    }));
  },

  async getMonthlyRevenue(): Promise<RevenuePoint[]> {
    await delay(200);
    const months = Array.from({ length: 6 }, (_, i) =>
      subMonths(startOfMonth(parseISO(TODAY)), 5 - i)
    );

    return months.map((monthDate) => {
      const key = format(monthDate, "yyyy-MM");
      const revenue = mockStore.bookings
        .filter(
          (b) =>
            b.status !== "cancelled" &&
            b.checkIn.startsWith(key)
        )
        .reduce((sum, b) => sum + (b.price - b.discount + b.gst), 0);
      return {
        label: format(monthDate, "MMM"),
        revenue,
      };
    });
  },
};
