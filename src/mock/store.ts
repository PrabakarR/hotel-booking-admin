import type { Booking, Customer, HotelSettings, Room } from "@/types";
import bookingsSeed from "@/mock/data/bookings.json";
import customersSeed from "@/mock/data/customers.json";
import hotelSeed from "@/mock/data/hotel.json";
import roomsSeed from "@/mock/data/rooms.json";

function clone<T>(value: T): T {
  return structuredClone(value);
}

class MockStore {
  rooms: Room[] = clone(roomsSeed as Room[]);
  customers: Customer[] = clone(customersSeed as Customer[]);
  bookings: Booking[] = clone(bookingsSeed as Booking[]);
  hotel: HotelSettings = clone(hotelSeed as HotelSettings);

  reset() {
    this.rooms = clone(roomsSeed as Room[]);
    this.customers = clone(customersSeed as Customer[]);
    this.bookings = clone(bookingsSeed as Booking[]);
    this.hotel = clone(hotelSeed as HotelSettings);
  }
}

export const mockStore = new MockStore();

export function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
