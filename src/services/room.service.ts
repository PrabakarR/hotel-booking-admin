import { roomRepository } from "@/repositories/mock-room.repository";
import type {
  CreateRoomInput,
  ListQuery,
  PaginatedResult,
  Room,
  UpdateRoomInput,
} from "@/types";

export const roomService = {
  list(query?: ListQuery): Promise<PaginatedResult<Room>> {
    return roomRepository.findAll(query);
  },
  getById(id: string): Promise<Room | null> {
    return roomRepository.findById(id);
  },
  getAll(): Promise<Room[]> {
    return roomRepository.getAll();
  },
  create(input: CreateRoomInput): Promise<Room> {
    return roomRepository.create(input);
  },
  update(id: string, input: UpdateRoomInput): Promise<Room> {
    return roomRepository.update(id, input);
  },
  remove(id: string): Promise<void> {
    return roomRepository.delete(id);
  },
};
