"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";
import { dashboardService } from "@/services/dashboard.service";

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => dashboardService.getStats(),
  });
}

export function useRecentBookings() {
  return useQuery({
    queryKey: queryKeys.dashboard.recent,
    queryFn: () => dashboardService.getRecentBookings(),
  });
}

export function useUpcomingCheckouts() {
  return useQuery({
    queryKey: queryKeys.dashboard.checkouts,
    queryFn: () => dashboardService.getUpcomingCheckouts(),
  });
}

export function useOccupancySeries() {
  return useQuery({
    queryKey: queryKeys.dashboard.occupancy,
    queryFn: () => dashboardService.getOccupancySeries(),
  });
}

export function useMonthlyRevenue() {
  return useQuery({
    queryKey: queryKeys.dashboard.revenue,
    queryFn: () => dashboardService.getMonthlyRevenue(),
  });
}
