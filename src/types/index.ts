export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance";
export type RoomType = "Standard" | "Deluxe" | "Suite" | "Family" | "Executive";

export type BookingStatus = "booked" | "checked_in" | "checked_out" | "cancelled";
export type PaymentMethod = "cash" | "upi" | "card" | "bank_transfer";

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  capacity: number;
  price: number;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  idProof: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingNumber?: string;
  customerId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  price: number;
  discount: number;
  gst: number;
  advance: number;
  balance: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HotelSettings {
  id: string;
  hotelName: string;
  logo?: string;
  gstNumber: string;
  address: string;
  phone: string;
  email: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  todaysCheckIn: number;
  todaysCheckOut: number;
  todaysRevenue: number;
  occupancyRate: number;
}

export interface OccupancyPoint {
  label: string;
  rate: number;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
}

export interface RecentBookingRow {
  id: string;
  customerName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  amount: number;
}

export interface UpcomingCheckout {
  id: string;
  customerName: string;
  roomNumber: string;
  checkOut: string;
  balance: number;
}

export interface BookingWithRelations extends Booking {
  customer: Customer;
  room: Room;
}

export interface CustomerWithStats extends Customer {
  previousBookings: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface BookingFilters extends ListQuery {
  status?: BookingStatus | "all";
  roomId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DailyRevenueRow {
  date: string;
  bookings: number;
  revenue: number;
}

export interface MonthlyRevenueRow {
  month: string;
  bookings: number;
  revenue: number;
}

export interface RoomOccupancyRow {
  roomNumber: string;
  roomType: RoomType;
  occupiedNights: number;
  occupancyRate: number;
  revenue: number;
}

export interface TopCustomerRow {
  customerId: string;
  name: string;
  phone: string;
  bookings: number;
  totalSpent: number;
}

export interface BookingStatistics {
  total: number;
  booked: number;
  checkedIn: number;
  checkedOut: number;
  cancelled: number;
  averageStayNights: number;
  averageBookingValue: number;
}

export interface ReportsData {
  dailyRevenue: DailyRevenueRow[];
  monthlyRevenue: MonthlyRevenueRow[];
  roomOccupancy: RoomOccupancyRow[];
  topCustomers: TopCustomerRow[];
  bookingStatistics: BookingStatistics;
}

export type CreateRoomInput = Omit<Room, "id" | "createdAt" | "updatedAt">;
export type UpdateRoomInput = Partial<CreateRoomInput>;

export type CreateCustomerInput = Omit<Customer, "id" | "createdAt" | "updatedAt">;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export type CreateBookingInput = Omit<Booking, "id" | "createdAt" | "updatedAt" | "balance"> & {
  balance?: number;
};
export type UpdateBookingInput = Partial<CreateBookingInput>;

export type UpdateHotelSettingsInput = Partial<
  Omit<HotelSettings, "id" | "updatedAt">
>;
