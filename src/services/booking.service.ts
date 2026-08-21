import { apiClient, toQuery } from "@/lib/api-client";
import type {
  BookingFilters,
  BookingWithRelations,
  CreateBookingInput,
  PaginatedResult,
  UpdateBookingInput,
} from "@/types";

export const bookingService = {
  list(query: BookingFilters = {}): Promise<PaginatedResult<BookingWithRelations>> {
    return apiClient(
      `/bookings${toQuery({
        search: query.search,
        page: query.page,
        pageSize: query.pageSize,
        status: query.status,
        roomId: query.roomId,
        customerId: query.customerId,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      })}`
    );
  },

  getById(id: string): Promise<BookingWithRelations> {
    return apiClient(`/bookings/${id}`);
  },

  create(input: CreateBookingInput): Promise<BookingWithRelations> {
    return apiClient("/bookings", { method: "POST", body: input });
  },

  update(id: string, input: UpdateBookingInput): Promise<BookingWithRelations> {
    return apiClient(`/bookings/${id}`, { method: "PATCH", body: input });
  },

  checkIn(id: string): Promise<BookingWithRelations> {
    return apiClient(`/bookings/${id}/check-in`, { method: "POST" });
  },

  checkout(id: string): Promise<BookingWithRelations> {
    return apiClient(`/bookings/${id}/check-out`, { method: "POST" });
  },

  cancel(id: string): Promise<BookingWithRelations> {
    return apiClient(`/bookings/${id}/cancel`, { method: "POST" });
  },

  addPayment(
    id: string,
    input: { amount: number; paymentMode: string; transactionReference?: string; notes?: string }
  ) {
    return apiClient(`/bookings/${id}/payments`, { method: "POST", body: input });
  },
};
