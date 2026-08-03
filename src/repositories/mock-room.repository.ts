import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { createId, delay, mockStore } from "@/mock/store";
import type {
  CreateRoomInput,
  ListQuery,
  PaginatedResult,
  Room,
  UpdateRoomInput,
} from "@/types";
import type { IRoomRepository } from "@/repositories/interfaces";

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

export class MockRoomRepository implements IRoomRepository {
  async findAll(query: ListQuery = {}): Promise<PaginatedResult<Room>> {
    await delay();
    const search = query.search?.toLowerCase().trim() ?? "";
    let items = [...mockStore.rooms].sort((a, b) =>
      a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
    );
    if (search) {
      items = items.filter(
        (room) =>
          room.roomNumber.toLowerCase().includes(search) ||
          room.roomType.toLowerCase().includes(search) ||
          room.status.toLowerCase().includes(search)
      );
    }
    return paginate(items, query.page, query.pageSize);
  }

  async findById(id: string): Promise<Room | null> {
    await delay(200);
    return mockStore.rooms.find((room) => room.id === id) ?? null;
  }

  async getAll(): Promise<Room[]> {
    await delay(200);
    return [...mockStore.rooms];
  }

  async create(input: CreateRoomInput): Promise<Room> {
    await delay();
    const now = new Date().toISOString();
    const room: Room = {
      ...input,
      id: createId("room"),
      createdAt: now,
      updatedAt: now,
    };
    mockStore.rooms.unshift(room);
    return room;
  }

  async update(id: string, input: UpdateRoomInput): Promise<Room> {
    await delay();
    const index = mockStore.rooms.findIndex((room) => room.id === id);
    if (index === -1) throw new Error("Room not found");
    const updated: Room = {
      ...mockStore.rooms[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    mockStore.rooms[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    await delay();
    mockStore.rooms = mockStore.rooms.filter((room) => room.id !== id);
  }
}

export const roomRepository = new MockRoomRepository();
