import type { BookingStatus, PaymentMethod, RoomStatus, RoomType } from "@/types";

export const ROOM_STATUSES: { value: RoomStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "cleaning", label: "Cleaning" },
  { value: "maintenance", label: "Maintenance" },
];

export const ROOM_TYPES: RoomType[] = [
  "Standard",
  "Deluxe",
  "Suite",
  "Family",
  "Executive",
];

export const BOOKING_STATUSES: { value: BookingStatus; label: string }[] = [
  { value: "booked", label: "Booked" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

export const GST_RATE = 0.12;
export const DEFAULT_PAGE_SIZE = 10;

export const DEMO_CREDENTIALS = {
  email: "admin@hotel.com",
  password: "password123",
};
