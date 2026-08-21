import {
  BookingStatus,
  PaymentMode,
  Role,
  RoomStatus,
  RoomType,
} from '@prisma/client';

export const TIMEZONE = 'Asia/Kolkata';

/** Parse YYYY-MM-DD as a calendar date without shifting the hotel day. */
export function parseHotelDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid hotel date "${value}". Use YYYY-MM-DD.`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Serialize a DATE column as YYYY-MM-DD. */
export function formatHotelDate(value: Date | string): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

export function todayInKolkata(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function kolkataDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '01';
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
  };
}

export function toNumber(value: { toString(): string } | number | string): number {
  return Number(value);
}

export function mapRole(role: Role): 'admin' | 'staff' {
  return role === Role.ADMIN ? 'admin' : 'staff';
}

export function mapRoomStatus(status: RoomStatus): string {
  return status.toLowerCase();
}

export function mapRoomType(type: RoomType): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export function mapBookingStatus(status: BookingStatus): string {
  return status.toLowerCase() as string;
}

export function mapPaymentMode(mode: PaymentMode): string {
  return mode.toLowerCase();
}

export function parseRole(value: string): Role {
  return value.toUpperCase() === 'ADMIN' ? Role.ADMIN : Role.STAFF;
}

export function parseRoomStatus(value: string): RoomStatus {
  const key = value.toUpperCase().replace(/-/g, '_') as keyof typeof RoomStatus;
  const parsed = RoomStatus[key];
  if (!parsed) {
    throw new Error(`Invalid room status "${value}"`);
  }
  return parsed;
}

export function parseRoomType(value: string): RoomType {
  const key = value.toUpperCase() as keyof typeof RoomType;
  const parsed = RoomType[key];
  if (!parsed) {
    throw new Error(`Invalid room type "${value}"`);
  }
  return parsed;
}

export function parseBookingStatus(value: string): BookingStatus {
  const key = value.toUpperCase().replace(/-/g, '_') as keyof typeof BookingStatus;
  const parsed = BookingStatus[key];
  if (!parsed) {
    throw new Error(`Invalid booking status "${value}"`);
  }
  return parsed;
}

export function parsePaymentMode(value: string): PaymentMode {
  const key = value.toUpperCase() as keyof typeof PaymentMode;
  const parsed = PaymentMode[key];
  if (!parsed) {
    throw new Error(`Invalid payment mode "${value}"`);
  }
  return parsed;
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    data,
    total,
    page,
    pageSize: limit,
    totalPages,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function bookingTotals(input: {
  rent: number;
  discount: number;
  gst: number;
  advance: number;
}) {
  const taxable = Math.max(0, input.rent - input.discount);
  const totalAmount = taxable + input.gst;
  const balanceAmount = Math.max(0, totalAmount - input.advance);
  return { taxable, totalAmount, balanceAmount };
}
