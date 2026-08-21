import { apiClient, toQuery } from "@/lib/api-client";
import type {
  BookingWithRelations,
  CreateCustomerInput,
  CustomerWithStats,
  ListQuery,
  PaginatedResult,
  UpdateCustomerInput,
} from "@/types";

export const customerService = {
  list(query: ListQuery = {}): Promise<PaginatedResult<CustomerWithStats>> {
    return apiClient(
      `/customers${toQuery({
        search: query.search,
        page: query.page,
        pageSize: query.pageSize,
      })}`
    );
  },

  getById(id: string): Promise<CustomerWithStats> {
    return apiClient(`/customers/${id}`);
  },

  getAll(): Promise<CustomerWithStats[]> {
    return apiClient("/customers/all");
  },

  create(input: CreateCustomerInput) {
    return apiClient("/customers", { method: "POST", body: input });
  },

  update(id: string, input: UpdateCustomerInput) {
    return apiClient(`/customers/${id}`, { method: "PATCH", body: input });
  },

  getBookings(customerId: string): Promise<BookingWithRelations[]> {
    return apiClient(`/customers/${customerId}/bookings`);
  },
};
