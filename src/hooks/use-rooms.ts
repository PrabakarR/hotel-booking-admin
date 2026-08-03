"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";
import { roomService } from "@/services/room.service";
import type { CreateRoomInput, ListQuery, UpdateRoomInput } from "@/types";

export function useRooms(query?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.rooms.list(query ?? {}),
    queryFn: () => roomService.list(query),
  });
}

export function useAllRooms() {
  return useQuery({
    queryKey: queryKeys.rooms.all,
    queryFn: () => roomService.getAll(),
  });
}

export function useRoomMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["rooms"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const create = useMutation({
    mutationFn: (input: CreateRoomInput) => roomService.create(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoomInput }) =>
      roomService.update(id, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => roomService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
