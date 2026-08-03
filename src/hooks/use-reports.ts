"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";
import { reportsService } from "@/services/reports.service";

export function useReports() {
  return useQuery({
    queryKey: queryKeys.reports,
    queryFn: () => reportsService.getReports(),
  });
}
