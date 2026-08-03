"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setSession: (token: string, user: User) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "hotel-auth",
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          useAuthStore.setState({ hydrated: true });
          return;
        }
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
