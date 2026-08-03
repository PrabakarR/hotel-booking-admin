"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CustomerForm } from "@/components/forms/CustomerForm";
import { BookingStatusBadge } from "@/components/shared/StatusBadge";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCustomer,
  useCustomerBookings,
  useCustomerMutations,
} from "@/hooks/use-customers";
import { formatCurrency, formatDate } from "@/lib/format";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: customer, isLoading } = useCustomer(id);
  const { data: bookings, isLoading: bookingsLoading } = useCustomerBookings(id);
  const { update } = useCustomerMutations();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading || !customer) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-2xl px-2"
            nativeButton={false}
            render={<Link href="/customers" />}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">
            {customer.previousBookings} previous bookings
          </p>
        </div>
        <Button className="rounded-2xl" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          Edit Customer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{customer.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{customer.email || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ID Proof</p>
              <p className="font-medium">{customer.idProof}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{customer.address}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Booking History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bookingsLoading || !bookings ? (
            <TableSkeleton rows={4} />
          ) : bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col gap-2 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    Room {booking.room.roomNumber} · {booking.room.roomType}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <BookingStatusBadge status={booking.status} />
                  <p className="text-sm font-medium">
                    {formatCurrency(booking.price - booking.discount + booking.gst)}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Modal open={editOpen} onOpenChange={setEditOpen} title="Edit Customer">
        <CustomerForm
          initialData={customer}
          loading={update.isPending}
          onCancel={() => setEditOpen(false)}
          onSubmit={async (values) => {
            await update.mutateAsync({ id: customer.id, input: values });
            toast.success("Customer updated");
            setEditOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
