"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BookingForm } from "@/components/forms/BookingForm";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { DataTable } from "@/components/shared/DataTable";
import { DatePicker } from "@/components/shared/DatePicker";
import { Modal } from "@/components/shared/Modal";
import { Pagination } from "@/components/shared/Pagination";
import { SearchBar } from "@/components/shared/SearchBar";
import { BookingStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllCustomers } from "@/hooks/use-customers";
import { useBookingMutations, useBookings } from "@/hooks/use-bookings";
import { useAllRooms } from "@/hooks/use-rooms";
import { BOOKING_STATUSES, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { BookingStatus, BookingWithRelations } from "@/types";

export function BookingsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [roomId, setRoomId] = useState<string>("all");
  const [customerId, setCustomerId] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BookingWithRelations | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingWithRelations | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<BookingWithRelations | null>(null);
  const [checkInTarget, setCheckInTarget] = useState<BookingWithRelations | null>(null);

  const { data, isLoading } = useBookings({
    search,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    status,
    roomId: roomId === "all" ? undefined : roomId,
    customerId: customerId === "all" ? undefined : customerId,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  const { data: rooms = [] } = useAllRooms();
  const { data: customers = [] } = useAllCustomers();
  const { create, update, cancel, checkIn, checkout } = useBookingMutations();

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setModalOpen(true);
      router.replace("/bookings");
    }
  }, [searchParams, router]);

  const columns = useMemo<ColumnDef<BookingWithRelations>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => row.original.customer.name,
      },
      {
        id: "room",
        header: "Room",
        cell: ({ row }) => row.original.room.roomNumber,
      },
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
        id: "total",
        header: "Total",
        cell: ({ row }) =>
          formatCurrency(
            row.original.price - row.original.discount + row.original.gst
          ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const booking = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={<Link href={`/bookings/${booking.id}`} />}
              >
                <Eye />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setEditing(booking);
                  setModalOpen(true);
                }}
              >
                <Pencil />
              </Button>
              {booking.status === "booked" ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setCheckInTarget(booking)}
                >
                  <LogIn />
                </Button>
              ) : null}
              {booking.status === "checked_in" ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setCheckoutTarget(booking)}
                >
                  <LogOut />
                </Button>
              ) : null}
              {booking.status !== "cancelled" && booking.status !== "checked_out" ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setCancelTarget(booking)}
                >
                  <XCircle />
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Create, filter, and manage guest reservations.
          </p>
        </div>
        <Button
          className="rounded-2xl"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="size-4" />
          New Booking
        </Button>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-card p-4 lg:grid-cols-6">
        <SearchBar
          className="max-w-none lg:col-span-2"
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search bookings..."
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus((value as BookingStatus | "all") ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-2xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {BOOKING_STATUSES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={roomId}
          onValueChange={(value) => {
            setRoomId(String(value ?? "all"));
            setPage(1);
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-2xl">
            <SelectValue placeholder="Room" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rooms</SelectItem>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.roomNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={customerId}
          onValueChange={(value) => {
            setCustomerId(String(value ?? "all"));
            setPage(1);
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-2xl">
            <SelectValue placeholder="Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-6 lg:grid-cols-2">
          <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Date from" />
          <DatePicker value={dateTo} onChange={setDateTo} placeholder="Date to" />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyTitle="No bookings found"
      />

      {data ? (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          pageSize={data.pageSize}
          onPageChange={setPage}
        />
      ) : null}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Booking" : "New Booking"}
        className="sm:max-w-2xl"
      >
        <BookingForm
          key={editing?.id ?? "new-booking"}
          initialData={editing}
          customers={customers}
          rooms={rooms}
          loading={create.isPending || update.isPending}
          onCancel={() => setModalOpen(false)}
          onSubmit={async (values) => {
            try {
              if (editing) {
                await update.mutateAsync({ id: editing.id, input: values });
                toast.success("Booking updated");
              } else {
                await create.mutateAsync(values);
                toast.success("Booking created");
              }
              setModalOpen(false);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to save booking");
            }
          }}
        />
      </Modal>

      <ConfirmationDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel booking?"
        description="This booking will be marked as cancelled."
        confirmLabel="Cancel Booking"
        destructive
        loading={cancel.isPending}
        onConfirm={async () => {
          if (!cancelTarget) return;
          try {
            await cancel.mutateAsync(cancelTarget.id);
            toast.success("Booking cancelled");
            setCancelTarget(null);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to cancel booking");
          }
        }}
      />

      <ConfirmationDialog
        open={Boolean(checkInTarget)}
        onOpenChange={(open) => !open && setCheckInTarget(null)}
        title="Check in guest?"
        description="Mark this booking as checked in and occupy the room."
        confirmLabel="Check in"
        loading={checkIn.isPending}
        onConfirm={async () => {
          if (!checkInTarget) return;
          try {
            await checkIn.mutateAsync(checkInTarget.id);
            toast.success("Guest checked in");
            setCheckInTarget(null);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to check in");
          }
        }}
      />

      <ConfirmationDialog
        open={Boolean(checkoutTarget)}
        onOpenChange={(open) => !open && setCheckoutTarget(null)}
        title="Checkout guest?"
        description="Mark this booking as checked out and free the room."
        confirmLabel="Checkout"
        loading={checkout.isPending}
        onConfirm={async () => {
          if (!checkoutTarget) return;
          try {
            await checkout.mutateAsync(checkoutTarget.id);
            toast.success("Guest checked out");
            setCheckoutTarget(null);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to checkout");
          }
        }}
      />
    </div>
  );
}
