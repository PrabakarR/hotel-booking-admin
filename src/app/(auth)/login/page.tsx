"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import { loginSchema, type LoginFormValues } from "@/schemas";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
      rememberMe: true,
    },
  });

  useEffect(() => {
    if (hydrated && token) {
      router.replace("/dashboard");
    }
  }, [hydrated, token, router]);

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const session = await authService.login(values.email, values.password);
      setSession(session.token, session.user);
      toast.success("Welcome back");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#f8fafc_100%)] px-4 dark:bg-[radial-gradient(circle_at_top,#1e3a5f_0%,#0b1220_45%,#0b1220_100%)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Building2 className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Cedar Ridge Lodge</h1>
            <p className="text-sm text-muted-foreground">Staff sign in</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="h-11 rounded-2xl"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              className="h-11 rounded-2xl"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.watch("rememberMe")}
                onCheckedChange={(checked) =>
                  form.setValue("rememberMe", Boolean(checked))
                }
              />
              Remember Me
            </label>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() =>
                toast.message("Password reset", {
                  description:
                    "Connect NestJS auth endpoints to enable forgot password emails.",
                })
              }
            >
              Forgot Password
            </button>
          </div>

          <Button type="submit" className="h-11 w-full rounded-2xl" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo: {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Internal use only ·{" "}
          <Link href="/dashboard" className="text-primary hover:underline">
            Dashboard
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
