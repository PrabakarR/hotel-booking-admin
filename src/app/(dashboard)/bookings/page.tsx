import { Suspense } from "react";
import { BookingsView } from "@/app/(dashboard)/bookings/bookings-view";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/shared/LoadingSkeleton";

export default function BookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <PageHeaderSkeleton />
          <TableSkeleton />
        </div>
      }
    >
      <BookingsView />
    </Suspense>
  );
}
