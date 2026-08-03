import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { calculateBookingTotals } from "@/lib/format";
import { createId, delay, mockStore } from "@/mock/store";
import type {
  Booking,
  BookingFilters,
  CreateBookingInput,
  PaginatedResult,
  UpdateBookingInput,
} from "@/types";
import type { IBookingRepository } from "@/repositories/interfaces";

function paginate<T>(items: T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export class MockBookingRepository implements IBookingRepository {
  async findAll(query: BookingFilters = {}): Promise<PaginatedResult<Booking>> {
    await delay();
    const search = query.search?.toLowerCase().trim() ?? "";
    let items = [...mockStore.bookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (query.status && query.status !== "all") {
      items = items.filter((booking) => booking.status === query.status);
    }
    if (query.roomId) {
      items = items.filter((booking) => booking.roomId === query.roomId);
    }
    if (query.customerId) {
      items = items.filter((booking) => booking.customerId === query.customerId);
    }
    if (query.dateFrom) {
      items = items.filter((booking) => booking.checkIn >= query.dateFrom!);
    }
    if (query.dateTo) {
      items = items.filter((booking) => booking.checkOut <= query.dateTo!);
    }
    if (search) {
      items = items.filter((booking) => {
        const customer = mockStore.customers.find((c) => c.id === booking.customerId);
        const room = mockStore.rooms.find((r) => r.id === booking.roomId);
        return (
          booking.id.toLowerCase().includes(search) ||
          customer?.name.toLowerCase().includes(search) ||
          room?.roomNumber.toLowerCase().includes(search) ||
          booking.status.toLowerCase().includes(search)
        );
      });
    }

    return paginate(items, query.page, query.pageSize);
  }

  async findById(id: string): Promise<Booking | null> {
    await delay(200);
    return mockStore.bookings.find((booking) => booking.id === id) ?? null;
  }

  async getAll(): Promise<Booking[]> {
    await delay(200);
    return [...mockStore.bookings];
  }

  async findByCustomerId(customerId: string): Promise<Booking[]> {
    await delay(200);
    return mockStore.bookings.filter((booking) => booking.customerId === customerId);
  }

  async create(input: CreateBookingInput): Promise<Booking> {
    await delay();
    const now = new Date().toISOString();
    const { balance } = calculateBookingTotals(input);
    const booking: Booking = {
      ...input,
      balance: input.balance ?? balance,
      notes: input.notes ?? "",
      id: createId("book"),
      createdAt: now,
      updatedAt: now,
    };
    mockStore.bookings.unshift(booking);

    if (booking.status === "checked_in") {
      const room = mockStore.rooms.find((r) => r.id === booking.roomId);
      if (room) room.status = "occupied";
    }

    return booking;
  }

  async update(id: string, input: UpdateBookingInput): Promise<Booking> {
    await delay();
    const index = mockStore.bookings.findIndex((booking) => booking.id === id);
    if (index === -1) throw new Error("Booking not found");

    const current = mockStore.bookings[index];
    const merged = { ...current, ...input };
    const { balance } = calculateBookingTotals(merged);

    const updated: Booking = {
      ...merged,
      balance: input.balance ?? balance,
      updatedAt: new Date().toISOString(),
    };
    mockStore.bookings[index] = updated;

    const room = mockStore.rooms.find((r) => r.id === updated.roomId);
    if (room) {
      if (updated.status === "checked_in") room.status = "occupied";
      if (updated.status === "checked_out") room.status = "cleaning";
      if (updated.status === "cancelled" && room.status === "occupied") {
        room.status = "available";
      }
    }

    return updated;
  }
}

export const bookingRepository = new MockBookingRepository();
