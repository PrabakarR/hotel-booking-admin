"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { motion } from "framer-motion";
import {
  BedDouble,
  CalendarCheck2,
  CalendarMinus2,
  DoorOpen,
  IndianRupee,
  Plus,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { OccupancyChart } from "@/components/charts/OccupancyChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { RoomForm } from "@/components/forms/RoomForm";
import { BookingStatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import {
  ChartSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/shared/LoadingSkeleton";
import { Modal } from "@/components/shared/Modal";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useDashboardStats,
  useMonthlyRevenue,
  useOccupancySeries,
  useRecentBookings,
  useUpcomingCheckouts,
} from "@/hooks/use-dashboard";
import { useRoomMutations } from "@/hooks/use-rooms";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import type { RecentBookingRow } from "@/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recent, isLoading: recentLoading } = useRecentBookings();
  const { data: checkouts, isLoading: checkoutsLoading } = useUpcomingCheckouts();
  const { data: occupancy, isLoading: occupancyLoading } = useOccupancySeries();
  const { data: revenue, isLoading: revenueLoading } = useMonthlyRevenue();
  const { create } = useRoomMutations();
  const [roomModalOpen, setRoomModalOpen] = useState(false);

  const columns = useMemo<ColumnDef<RecentBookingRow>[]>(
    () => [
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "roomNumber", header: "Room" },
      {
        accessorKey: "checkIn",
        header: "Check In",
        cell: ({ row }) => formatDate(row.original.checkIn),
      },
      {
        accessorKey: "checkOut",
        header: "Check Out",
        cell: ({ row }) => formatDate(row.original.checkOut),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <BookingStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(row.original.amount),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Today&apos;s occupancy, arrivals, and revenue at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-2xl"
            nativeButton={false}
            render={<Link href="/bookings?new=1" />}
          >
            <Plus className="size-4" />
            New Booking
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => setRoomModalOpen(true)}
          >
            <BedDouble className="size-4" />
            Add Room
          </Button>
        </div>
      </motion.div>

      {statsLoading || !stats ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Total Rooms" value={stats.totalRooms} icon={BedDouble} />
          <StatCard
            title="Available Rooms"
            value={stats.availableRooms}
            icon={DoorOpen}
            accent="success"
          />
          <StatCard
            title="Occupied Rooms"
            value={stats.occupiedRooms}
            icon={UsersRound}
            accent="danger"
            description={formatPercent(stats.occupancyRate)}
          />
          <StatCard
            title="Today's Check In"
            value={stats.todaysCheckIn}
            icon={CalendarCheck2}
            accent="primary"
          />
          <StatCard
            title="Today's Check Out"
            value={stats.todaysCheckOut}
            icon={CalendarMinus2}
            accent="warning"
          />
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(stats.todaysRevenue)}
            icon={IndianRupee}
            accent="success"
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {occupancyLoading || !occupancy ? (
              <ChartSkeleton />
            ) : (
              <OccupancyChart data={occupancy} />
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading || !revenue ? (
              <ChartSkeleton />
            ) : (
              <RevenueChart data={revenue} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Recent Bookings</h2>
          {recentLoading || !recent ? (
            <TableSkeleton rows={5} />
          ) : (
            <DataTable columns={columns} data={recent} />
          )}
        </div>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Upcoming Check Outs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checkoutsLoading || !checkouts ? (
              <TableSkeleton rows={4} />
            ) : checkouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming check-outs.</p>
            ) : (
              checkouts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{item.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      Room {item.roomNumber} · {formatDate(item.checkOut)}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(item.balance)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={roomModalOpen}
        onOpenChange={setRoomModalOpen}
        title="Add Room"
        description="Create a new room for the property inventory."
      >
        <RoomForm
          loading={create.isPending}
          onCancel={() => setRoomModalOpen(false)}
          onSubmit={async (values) => {
            await create.mutateAsync(values);
            toast.success("Room added");
            setRoomModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
