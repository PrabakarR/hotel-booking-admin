import { settingsRepository } from "@/repositories/mock-settings.repository";
import type { UpdateHotelSettingsInput } from "@/types";

export const settingsService = {
  get() {
    return settingsRepository.get();
  },
  update(input: UpdateHotelSettingsInput) {
    return settingsRepository.update(input);
  },
};
