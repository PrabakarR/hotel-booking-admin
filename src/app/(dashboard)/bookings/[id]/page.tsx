"use client";

import { ArrowLeft, LogIn, LogOut, Pencil, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BookingForm } from "@/components/forms/BookingForm";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Modal } from "@/components/shared/Modal";
import { BookingStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAllCustomers } from "@/hooks/use-customers";
import { useBooking, useBookingMutations } from "@/hooks/use-bookings";
import { useAllRooms } from "@/hooks/use-rooms";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: booking, isLoading } = useBooking(id);
  const { data: rooms = [] } = useAllRooms();
  const { data: customers = [] } = useAllCustomers();
  const { update, cancel, checkIn, checkout } = useBookingMutations();
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);

  if (isLoading || !booking) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  const total = booking.price - booking.discount + booking.gst;
  const paymentLabel =
    PAYMENT_METHODS.find((item) => item.value === booking.paymentMethod)?.label ??
    booking.paymentMethod;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-2xl px-2"
            nativeButton={false}
            render={<Link href="/bookings" />}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Booking {booking.bookingNumber ?? booking.id}
            </h1>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {booking.customer.name} · Room {booking.room.roomNumber}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="rounded-2xl" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          {booking.status === "booked" ? (
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setCheckInOpen(true)}
            >
              <LogIn className="size-4" />
              Check in
            </Button>
          ) : null}
          {booking.status === "checked_in" ? (
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setCheckoutOpen(true)}
            >
              <LogOut className="size-4" />
              Checkout
            </Button>
          ) : null}
          {booking.status !== "cancelled" && booking.status !== "checked_out" ? (
            <Button
              variant="destructive"
              className="rounded-2xl"
              onClick={() => setCancelOpen(true)}
            >
              <XCircle className="size-4" />
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Stay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Check In</p>
              <p className="font-medium">{formatDate(booking.checkIn)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Check Out</p>
              <p className="font-medium">{formatDate(booking.checkOut)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Guests</p>
              <p className="font-medium">
                {booking.adults} adults · {booking.children} children
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span>{formatCurrency(booking.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>{formatCurrency(booking.discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST</span>
              <span>{formatCurrency(booking.gst)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Advance</span>
              <span>{formatCurrency(booking.advance)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total / Balance</span>
              <span>
                {formatCurrency(total)} / {formatCurrency(booking.balance)}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground">Method</p>
              <p className="font-medium">{paymentLabel}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none md:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {booking.notes || "No notes added."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Modal
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Booking"
        className="sm:max-w-2xl"
      >
        <BookingForm
          initialData={booking}
          customers={customers}
          rooms={rooms}
          loading={update.isPending}
          onCancel={() => setEditOpen(false)}
          onSubmit={async (values) => {
            try {
              await update.mutateAsync({ id: booking.id, input: values });
              toast.success("Booking updated");
              setEditOpen(false);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to update booking");
            }
          }}
        />
      </Modal>

      <ConfirmationDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel booking?"
        description="This booking will be marked as cancelled."
        confirmLabel="Cancel Booking"
        destructive
        loading={cancel.isPending}
        onConfirm={async () => {
          try {
            await cancel.mutateAsync(booking.id);
            toast.success("Booking cancelled");
            setCancelOpen(false);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to cancel booking");
          }
        }}
      />

      <ConfirmationDialog
        open={checkInOpen}
        onOpenChange={setCheckInOpen}
        title="Check in guest?"
        description="Mark this booking as checked in and occupy the room."
        confirmLabel="Check in"
        loading={checkIn.isPending}
        onConfirm={async () => {
          try {
            await checkIn.mutateAsync(booking.id);
            toast.success("Guest checked in");
            setCheckInOpen(false);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to check in");
          }
        }}
      />

      <ConfirmationDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        title="Checkout guest?"
        description="Mark this booking as checked out and free the room."
        confirmLabel="Checkout"
        loading={checkout.isPending}
        onConfirm={async () => {
          try {
            await checkout.mutateAsync(booking.id);
            toast.success("Guest checked out");
            setCheckoutOpen(false);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to checkout");
          }
        }}
      />
    </div>
  );
}
