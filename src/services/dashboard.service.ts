import { apiClient } from "@/lib/api-client";
import type {
  DashboardStats,
  OccupancyPoint,
  RecentBookingRow,
  RevenuePoint,
  UpcomingCheckout,
} from "@/types";

export const dashboardService = {
  getStats(): Promise<DashboardStats> {
    return apiClient("/dashboard/summary");
  },

  getRecentBookings(): Promise<RecentBookingRow[]> {
    return apiClient("/dashboard/recent-bookings");
  },

  getUpcomingCheckouts(): Promise<UpcomingCheckout[]> {
    return apiClient("/dashboard/upcoming-checkouts");
  },

  getOccupancySeries(): Promise<OccupancyPoint[]> {
    return apiClient("/dashboard/occupancy-series");
  },

  getMonthlyRevenue(): Promise<RevenuePoint[]> {
    return apiClient("/dashboard/monthly-revenue");
  },
};
