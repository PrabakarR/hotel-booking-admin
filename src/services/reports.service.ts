import { apiClient } from "@/lib/api-client";
import type { ReportsData } from "@/types";

export const reportsService = {
  getReports(from?: string, to?: string): Promise<ReportsData> {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return apiClient(`/reports${qs ? `?${qs}` : ""}`);
  },
};
