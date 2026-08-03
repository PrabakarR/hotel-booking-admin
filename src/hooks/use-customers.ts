"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";
import { customerService } from "@/services/customer.service";
import type { CreateCustomerInput, ListQuery, UpdateCustomerInput } from "@/types";

export function useCustomers(query?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.customers.list(query ?? {}),
    queryFn: () => customerService.list(query),
  });
}

export function useAllCustomers() {
  return useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: () => customerService.getAll(),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => customerService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCustomerBookings(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.bookings(id),
    queryFn: () => customerService.getBookings(id),
    enabled: Boolean(id),
  });
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["customers"] });
  };

  const create = useMutation({
    mutationFn: (input: CreateCustomerInput) => customerService.create(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) =>
      customerService.update(id, input),
    onSuccess: invalidate,
  });

  return { create, update };
}
