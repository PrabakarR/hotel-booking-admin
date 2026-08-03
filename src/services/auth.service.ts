import { DEMO_CREDENTIALS } from "@/lib/constants";
import { delay } from "@/mock/store";
import type { AuthSession } from "@/types";

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    await delay(500);
    if (
      email.toLowerCase() !== DEMO_CREDENTIALS.email ||
      password !== DEMO_CREDENTIALS.password
    ) {
      throw new Error("Invalid email or password");
    }

    return {
      token: `mock-jwt-${Date.now()}`,
      user: {
        id: "user-001",
        name: "Front Desk Admin",
        email: DEMO_CREDENTIALS.email,
        role: "admin",
      },
    };
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    await delay(400);
    return {
      message: `If an account exists for ${email}, a reset link will be sent.`,
    };
  },
};
