import { apiClient } from "@/lib/api-client";
import type { HotelSettings, UpdateHotelSettingsInput } from "@/types";

export const settingsService = {
  get(): Promise<HotelSettings> {
    return apiClient("/settings");
  },
  update(input: UpdateHotelSettingsInput): Promise<HotelSettings> {
    return apiClient("/settings", { method: "PATCH", body: input });
  },
};
