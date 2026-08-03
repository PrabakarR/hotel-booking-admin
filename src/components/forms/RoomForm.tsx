"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { ROOM_STATUSES, ROOM_TYPES } from "@/lib/constants";
import { roomSchema, type RoomFormValues } from "@/schemas";
import type { Room } from "@/types";

interface RoomFormProps {
  initialData?: Room | null;
  onSubmit: (values: RoomFormValues) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}

export function RoomForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: RoomFormProps) {
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: initialData?.roomNumber ?? "",
      floor: initialData?.floor ?? 1,
      roomType: initialData?.roomType ?? "Standard",
      capacity: initialData?.capacity ?? 2,
      price: initialData?.price ?? 2500,
      status: initialData?.status ?? "available",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="roomNumber">Room Number</Label>
          <Input id="roomNumber" className="rounded-2xl" {...form.register("roomNumber")} />
          {form.formState.errors.roomNumber ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.roomNumber.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="floor">Floor</Label>
          <Input
            id="floor"
            type="number"
            className="rounded-2xl"
            {...form.register("floor")}
          />
        </div>
        <div className="space-y-2">
          <Label>Room Type</Label>
          <Select
            value={form.watch("roomType")}
            onValueChange={(value) =>
              form.setValue("roomType", value as RoomFormValues["roomType"])
            }
          >
            <SelectTrigger className="h-10 w-full rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROOM_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            className="rounded-2xl"
            {...form.register("capacity")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            className="rounded-2xl"
            {...form.register("price")}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value) =>
              form.setValue("status", value as RoomFormValues["status"])
            }
          >
            <SelectTrigger className="h-10 w-full rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROOM_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-2xl">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="rounded-2xl">
          {loading ? "Saving..." : initialData ? "Update Room" : "Add Room"}
        </Button>
      </div>
    </form>
  );
}
