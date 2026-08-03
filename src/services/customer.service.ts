import { bookingRepository } from "@/repositories/mock-booking.repository";
import { customerRepository } from "@/repositories/mock-customer.repository";
import type {
  CreateCustomerInput,
  CustomerWithStats,
  ListQuery,
  PaginatedResult,
  UpdateCustomerInput,
} from "@/types";

export const customerService = {
  async list(query?: ListQuery): Promise<PaginatedResult<CustomerWithStats>> {
    const result = await customerRepository.findAll(query);
    const bookings = await bookingRepository.getAll();
    const data = result.data.map((customer) => ({
      ...customer,
      previousBookings: bookings.filter((b) => b.customerId === customer.id).length,
    }));
    return { ...result, data };
  },

  async getById(id: string): Promise<CustomerWithStats | null> {
    const customer = await customerRepository.findById(id);
    if (!customer) return null;
    const bookings = await bookingRepository.findByCustomerId(id);
    return { ...customer, previousBookings: bookings.length };
  },

  getAll() {
    return customerRepository.getAll();
  },

  create(input: CreateCustomerInput) {
    return customerRepository.create(input);
  },

  update(id: string, input: UpdateCustomerInput) {
    return customerRepository.update(id, input);
  },

  async getBookings(customerId: string) {
    const bookings = await bookingRepository.findByCustomerId(customerId);
    const rooms = await import("@/repositories/mock-room.repository").then(
      (m) => m.roomRepository.getAll()
    );
    const roomList = await rooms;
    return bookings.map((booking) => ({
      ...booking,
      room: roomList.find((room) => room.id === booking.roomId)!,
    }));
  },
};
