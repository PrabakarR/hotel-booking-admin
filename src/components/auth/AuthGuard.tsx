"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return (
      <div className="space-y-6 p-6">
        <PageHeaderSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  return <>{children}</>;
}
