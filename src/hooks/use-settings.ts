"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";
import { settingsService } from "@/services/settings.service";
import type { UpdateHotelSettingsInput } from "@/types";

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => settingsService.get(),
  });
}

export function useSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateHotelSettingsInput) => settingsService.update(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}
