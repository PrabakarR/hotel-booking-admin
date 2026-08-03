import { delay, mockStore } from "@/mock/store";
import type { HotelSettings, UpdateHotelSettingsInput } from "@/types";
import type { ISettingsRepository } from "@/repositories/interfaces";

export class MockSettingsRepository implements ISettingsRepository {
  async get(): Promise<HotelSettings> {
    await delay(200);
    return { ...mockStore.hotel };
  }

  async update(input: UpdateHotelSettingsInput): Promise<HotelSettings> {
    await delay();
    mockStore.hotel = {
      ...mockStore.hotel,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return { ...mockStore.hotel };
  }
}

export const settingsRepository = new MockSettingsRepository();

export const repositoryRegistry = {
  rooms: () => import("@/repositories/mock-room.repository").then((m) => m.roomRepository),
  customers: () =>
    import("@/repositories/mock-customer.repository").then((m) => m.customerRepository),
  bookings: () =>
    import("@/repositories/mock-booking.repository").then((m) => m.bookingRepository),
  settings: () =>
    import("@/repositories/mock-settings.repository").then((m) => m.settingsRepository),
};
