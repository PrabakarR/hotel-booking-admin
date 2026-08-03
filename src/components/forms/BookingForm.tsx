"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { DatePicker } from "@/components/shared/DatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BOOKING_STATUSES, GST_RATE, PAYMENT_METHODS } from "@/lib/constants";
import { calculateBookingTotals, formatCurrency, nightsBetween } from "@/lib/format";
import { bookingSchema, type BookingFormValues } from "@/schemas";
import type { Booking, Customer, Room } from "@/types";

interface BookingFormProps {
  initialData?: Booking | null;
  customers: Customer[];
  rooms: Room[];
  onSubmit: (values: BookingFormValues) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}

export function BookingForm({
  initialData,
  customers,
  rooms,
  onSubmit,
  onCancel,
  loading,
}: BookingFormProps) {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerId: initialData?.customerId ?? "",
      roomId: initialData?.roomId ?? "",
      checkIn: initialData?.checkIn ?? "",
      checkOut: initialData?.checkOut ?? "",
      adults: initialData?.adults ?? 1,
      children: initialData?.children ?? 0,
      price: initialData?.price ?? 0,
      discount: initialData?.discount ?? 0,
      gst: initialData?.gst ?? 0,
      advance: initialData?.advance ?? 0,
      paymentMethod: initialData?.paymentMethod ?? "upi",
      notes: initialData?.notes ?? "",
      status: initialData?.status ?? "booked",
    },
  });

  const roomId = form.watch("roomId");
  const checkIn = form.watch("checkIn");
  const checkOut = form.watch("checkOut");
  const price = form.watch("price");
  const discount = form.watch("discount");
  const gst = form.watch("gst");
  const advance = form.watch("advance");

  useEffect(() => {
    if (!roomId || !checkIn || !checkOut || initialData) return;
    const room = rooms.find((item) => item.id === roomId);
    if (!room) return;
    const nights = nightsBetween(checkIn, checkOut);
    const nextPrice = room.price * nights;
    const nextGst = Math.round((nextPrice - (form.getValues("discount") || 0)) * GST_RATE);
    form.setValue("price", nextPrice);
    form.setValue("gst", nextGst);
  }, [roomId, checkIn, checkOut, rooms, form, initialData]);

  useEffect(() => {
    if (!price) return;
    const nextGst = Math.round((price - (discount || 0)) * GST_RATE);
    if (!initialData || gst === 0) {
      form.setValue("gst", nextGst);
    }
  }, [price, discount, form, gst, initialData]);

  const { total, balance } = calculateBookingTotals({
    price: Number(price) || 0,
    discount: Number(discount) || 0,
    gst: Number(gst) || 0,
    advance: Number(advance) || 0,
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Customer</Label>
          <Select
            value={form.watch("customerId") || undefined}
            onValueChange={(value) => form.setValue("customerId", String(value ?? ""))}
          >
            <SelectTrigger className="h-10 w-full rounded-2xl">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} · {customer.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.customerId ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.customerId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Room</Label>
          <Select
            value={form.watch("roomId") || undefined}
            onValueChange={(value) => form.setValue("roomId", String(value ?? ""))}
          >
            <SelectTrigger className="h-10 w-full rounded-2xl">
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.roomNumber} · {room.roomType} · {formatCurrency(room.price)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Check In</Label>
          <DatePicker
            value={checkIn}
            onChange={(value) => form.setValue("checkIn", value, { shouldValidate: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Check Out</Label>
          <DatePicker
            value={checkOut}
            onChange={(value) => form.setValue("checkOut", value, { shouldValidate: true })}
          />
          {form.formState.errors.checkOut ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.checkOut.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="adults">Adults</Label>
          <Input id="adults" type="number" className="rounded-2xl" {...form.register("adults")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="children">Children</Label>
          <Input
            id="children"
            type="number"
            className="rounded-2xl"
            {...form.register("children")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" type="number" className="rounded-2xl" {...form.register("price")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount">Discount</Label>
          <Input
            id="discount"
            type="number"
            className="rounded-2xl"
            {...form.register("discount")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gst">GST</Label>
          <Input id="gst" type="number" className="rounded-2xl" {...form.register("gst")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="advance">Advance</Label>
          <Input
            id="advance"
            type="number"
            className="rounded-2xl"
            {...form.register("advance")}
          />
        </div>

        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select
            value={form.watch("paymentMethod")}
            onValueChange={(value) =>
              form.setValue("paymentMethod", value as BookingFormValues["paymentMethod"])
            }
          >
            <SelectTrigger className="h-10 w-full rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Booking Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value) =>
              form.setValue("status", value as BookingFormValues["status"])
            }
          >
            <SelectTrigger className="h-10 w-full rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOKING_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" className="rounded-2xl" {...form.register("notes")} />
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl bg-muted/60 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold">{formatCurrency(total)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-lg font-semibold">{formatCurrency(balance)}</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-2xl">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="rounded-2xl">
          {loading ? "Saving..." : initialData ? "Update Booking" : "Create Booking"}
        </Button>
      </div>
    </form>
  );
}
