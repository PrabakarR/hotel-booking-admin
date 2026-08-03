import { calculateBookingTotals } from "@/lib/format";
import { bookingRepository } from "@/repositories/mock-booking.repository";
import { customerRepository } from "@/repositories/mock-customer.repository";
import { roomRepository } from "@/repositories/mock-room.repository";
import type {
  BookingFilters,
  BookingWithRelations,
  CreateBookingInput,
  PaginatedResult,
  UpdateBookingInput,
} from "@/types";

async function withRelations(
  bookings: Awaited<ReturnType<typeof bookingRepository.getAll>>
): Promise<BookingWithRelations[]> {
  const [customers, rooms] = await Promise.all([
    customerRepository.getAll(),
    roomRepository.getAll(),
  ]);

  return bookings.map((booking) => {
    const customer = customers.find((c) => c.id === booking.customerId);
    const room = rooms.find((r) => r.id === booking.roomId);
    if (!customer || !room) {
      throw new Error(`Missing relations for booking ${booking.id}`);
    }
    return { ...booking, customer, room };
  });
}

export const bookingService = {
  async list(query?: BookingFilters): Promise<PaginatedResult<BookingWithRelations>> {
    const result = await bookingRepository.findAll(query);
    const data = await withRelations(result.data);
    return { ...result, data };
  },

  async getById(id: string): Promise<BookingWithRelations | null> {
    const booking = await bookingRepository.findById(id);
    if (!booking) return null;
    const [enriched] = await withRelations([booking]);
    return enriched;
  },

  create(input: CreateBookingInput) {
    const { balance } = calculateBookingTotals(input);
    return bookingRepository.create({ ...input, balance });
  },

  update(id: string, input: UpdateBookingInput) {
    return bookingRepository.update(id, input);
  },

  cancel(id: string) {
    return bookingRepository.update(id, { status: "cancelled", balance: 0 });
  },

  checkout(id: string) {
    return bookingRepository.update(id, { status: "checked_out", balance: 0 });
  },
};
