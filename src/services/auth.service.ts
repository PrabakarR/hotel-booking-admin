import { apiClient } from "@/lib/api-client";
import type { AuthSession, User } from "@/types";

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    return apiClient<AuthSession>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },

  async me(): Promise<User> {
    return apiClient<User>("/auth/me");
  },

  async logout(): Promise<void> {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch {
      // Token discard on the client is enough for JWT logout.
    }
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return {
      message: `If an account exists for ${email}, a reset link will be sent.`,
    };
  },
};
