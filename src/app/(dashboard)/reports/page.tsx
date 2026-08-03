"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/DataTable";
import { StatCardsSkeleton, TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from "@/hooks/use-reports";
import { exportReportsToExcel, exportReportsToPdf } from "@/lib/export";
import { formatCurrency, formatPercent } from "@/lib/format";
import type {
  DailyRevenueRow,
  RoomOccupancyRow,
  TopCustomerRow,
} from "@/types";
import {
  CalendarDays,
  ChartColumn,
  IndianRupee,
  Users,
} from "lucide-react";

export default function ReportsPage() {
  const { data, isLoading } = useReports();

  const dailyColumns = useMemo<ColumnDef<DailyRevenueRow>[]>(
    () => [
      { accessorKey: "date", header: "Date" },
      { accessorKey: "bookings", header: "Bookings" },
      {
        accessorKey: "revenue",
        header: "Revenue",
        cell: ({ row }) => formatCurrency(row.original.revenue),
      },
    ],
    []
  );

  const occupancyColumns = useMemo<ColumnDef<RoomOccupancyRow>[]>(
    () => [
      { accessorKey: "roomNumber", header: "Room" },
      { accessorKey: "roomType", header: "Type" },
      { accessorKey: "occupiedNights", header: "Occupied Nights" },
      {
        accessorKey: "occupancyRate",
        header: "Occupancy",
        cell: ({ row }) => formatPercent(row.original.occupancyRate),
      },
      {
        accessorKey: "revenue",
        header: "Revenue",
        cell: ({ row }) => formatCurrency(row.original.revenue),
      },
    ],
    []
  );

  const topCustomerColumns = useMemo<ColumnDef<TopCustomerRow>[]>(
    () => [
      { accessorKey: "name", header: "Customer" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "bookings", header: "Bookings" },
      {
        accessorKey: "totalSpent",
        header: "Total Spent",
        cell: ({ row }) => formatCurrency(row.original.totalSpent),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Revenue, occupancy, and guest performance insights.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-2xl"
            disabled={!data}
            onClick={() => {
              if (!data) return;
              exportReportsToExcel(data);
              toast.success("Excel exported");
            }}
          >
            <FileSpreadsheet className="size-4" />
            Export Excel
          </Button>
          <Button
            className="rounded-2xl"
            disabled={!data}
            onClick={() => {
              if (!data) return;
              exportReportsToPdf(data);
              toast.success("PDF exported");
            }}
          >
            <FileDown className="size-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {isLoading || !data ? (
        <>
          <StatCardsSkeleton count={4} />
          <TableSkeleton />
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Bookings"
              value={data.bookingStatistics.total}
              icon={CalendarDays}
            />
            <StatCard
              title="Checked In"
              value={data.bookingStatistics.checkedIn}
              icon={Users}
              accent="success"
            />
            <StatCard
              title="Avg Stay"
              value={`${data.bookingStatistics.averageStayNights.toFixed(1)} nights`}
              icon={ChartColumn}
              accent="warning"
            />
            <StatCard
              title="Avg Booking Value"
              value={formatCurrency(data.bookingStatistics.averageBookingValue)}
              icon={IndianRupee}
              accent="primary"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-sm font-medium">Daily Revenue</h2>
              <DataTable columns={dailyColumns} data={data.dailyRevenue} />
            </div>
            <div className="space-y-3">
              <h2 className="text-sm font-medium">Top Customers</h2>
              <DataTable columns={topCustomerColumns} data={data.topCustomers} />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-medium">Room Occupancy</h2>
            <DataTable columns={occupancyColumns} data={data.roomOccupancy} />
          </div>

          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.monthlyRevenue.map((row) => (
                <div
                  key={row.month}
                  className="rounded-2xl border px-4 py-3"
                >
                  <p className="text-sm text-muted-foreground">{row.month}</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(row.revenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.bookings} bookings
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Booking Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Booked", data.bookingStatistics.booked],
                ["Checked In", data.bookingStatistics.checkedIn],
                ["Checked Out", data.bookingStatistics.checkedOut],
                ["Cancelled", data.bookingStatistics.cancelled],
                ["Total", data.bookingStatistics.total],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-2xl border px-4 py-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-semibold">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
