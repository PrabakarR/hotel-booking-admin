import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  floor: z.coerce.number().int().min(0, "Floor is required"),
  roomType: z.enum(["Standard", "Deluxe", "Suite", "Family", "Executive"]),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  status: z.enum(["available", "occupied", "cleaning", "maintenance"]),
});

export type RoomFormValues = z.infer<typeof roomSchema>;

export const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(8, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  idProof: z.string().min(4, "ID proof is required"),
  address: z.string().min(5, "Address is required"),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

export const bookingSchema = z
  .object({
    customerId: z.string().min(1, "Customer is required"),
    roomId: z.string().min(1, "Room is required"),
    checkIn: z.string().min(1, "Check-in date is required"),
    checkOut: z.string().min(1, "Check-out date is required"),
    adults: z.coerce.number().int().min(1, "At least 1 adult"),
    children: z.coerce.number().int().min(0),
    price: z.coerce.number().min(0),
    discount: z.coerce.number().min(0),
    gst: z.coerce.number().min(0),
    advance: z.coerce.number().min(0),
    paymentMethod: z.enum(["cash", "upi", "card", "bank_transfer"]),
    notes: z.string().optional(),
    status: z.enum(["booked", "checked_in", "checked_out", "cancelled"]),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

export type BookingFormValues = z.infer<typeof bookingSchema>;

export const hotelSettingsSchema = z.object({
  hotelName: z.string().min(2, "Hotel name is required"),
  logo: z.string().optional(),
  gstNumber: z.string().min(5, "GST number is required"),
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(8, "Phone is required"),
  email: z.string().email("Enter a valid email"),
});

export type HotelSettingsFormValues = z.infer<typeof hotelSettingsSchema>;
