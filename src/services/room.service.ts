import { apiClient, toQuery } from "@/lib/api-client";
import type {
  CreateRoomInput,
  ListQuery,
  PaginatedResult,
  Room,
  UpdateRoomInput,
} from "@/types";

export const roomService = {
  list(query: ListQuery = {}): Promise<PaginatedResult<Room>> {
    return apiClient(
      `/rooms${toQuery({
        search: query.search,
        page: query.page,
        pageSize: query.pageSize,
      })}`
    );
  },

  getById(id: string): Promise<Room> {
    return apiClient(`/rooms/${id}`);
  },

  getAll(): Promise<Room[]> {
    return apiClient("/rooms/all");
  },

  getAvailable(checkIn: string, checkOut: string): Promise<Room[]> {
    return apiClient(
      `/rooms/available${toQuery({ checkIn, checkOut })}`
    );
  },

  create(input: CreateRoomInput): Promise<Room> {
    return apiClient("/rooms", { method: "POST", body: input });
  },

  update(id: string, input: UpdateRoomInput): Promise<Room> {
    return apiClient(`/rooms/${id}`, { method: "PATCH", body: input });
  },

  remove(id: string): Promise<void> {
    return apiClient(`/rooms/${id}`, { method: "DELETE" });
  },
};
