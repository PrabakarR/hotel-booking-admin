import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus, RoomStatus } from "@/types";

const roomStatusStyles: Record<RoomStatus, string> = {
  available: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-transparent",
  occupied: "bg-destructive/15 text-destructive border-transparent",
  cleaning: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-transparent",
  maintenance: "bg-slate-200 text-slate-600 border-transparent dark:bg-slate-700 dark:text-slate-200",
};

const bookingStatusStyles: Record<BookingStatus, string> = {
  booked: "bg-primary/15 text-primary border-transparent",
  checked_in: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-transparent",
  checked_out: "bg-slate-200 text-slate-600 border-transparent dark:bg-slate-700 dark:text-slate-200",
  cancelled: "bg-destructive/15 text-destructive border-transparent",
};

const roomLabels: Record<RoomStatus, string> = {
  available: "Available",
  occupied: "Occupied",
  cleaning: "Cleaning",
  maintenance: "Maintenance",
};

const bookingLabels: Record<BookingStatus, string> = {
  booked: "Booked",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return (
    <Badge variant="outline" className={cn("rounded-full", roomStatusStyles[status])}>
      {roomLabels[status]}
    </Badge>
  );
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant="outline" className={cn("rounded-full", bookingStatusStyles[status])}>
      {bookingLabels[status]}
    </Badge>
  );
}
