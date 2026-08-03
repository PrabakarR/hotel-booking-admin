"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";
import { bookingService } from "@/services/booking.service";
import type { BookingFilters, CreateBookingInput, UpdateBookingInput } from "@/types";

export function useBookings(query?: BookingFilters) {
  return useQuery({
    queryKey: queryKeys.bookings.list(query ?? {}),
    queryFn: () => bookingService.list(query),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => bookingService.getById(id),
    enabled: Boolean(id),
  });
}

export function useBookingMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    void queryClient.invalidateQueries({ queryKey: ["rooms"] });
    void queryClient.invalidateQueries({ queryKey: ["customers"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["reports"] });
  };

  const create = useMutation({
    mutationFn: (input: CreateBookingInput) => bookingService.create(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBookingInput }) =>
      bookingService.update(id, input),
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: invalidate,
  });

  const checkout = useMutation({
    mutationFn: (id: string) => bookingService.checkout(id),
    onSuccess: invalidate,
  });

  return { create, update, cancel, checkout };
}
