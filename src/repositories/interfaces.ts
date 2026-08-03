import type {
  Booking,
  BookingFilters,
  CreateBookingInput,
  CreateCustomerInput,
  CreateRoomInput,
  Customer,
  HotelSettings,
  ListQuery,
  PaginatedResult,
  Room,
  UpdateBookingInput,
  UpdateCustomerInput,
  UpdateHotelSettingsInput,
  UpdateRoomInput,
} from "@/types";

export interface IRoomRepository {
  findAll(query?: ListQuery): Promise<PaginatedResult<Room>>;
  findById(id: string): Promise<Room | null>;
  create(input: CreateRoomInput): Promise<Room>;
  update(id: string, input: UpdateRoomInput): Promise<Room>;
  delete(id: string): Promise<void>;
  getAll(): Promise<Room[]>;
}

export interface ICustomerRepository {
  findAll(query?: ListQuery): Promise<PaginatedResult<Customer>>;
  findById(id: string): Promise<Customer | null>;
  create(input: CreateCustomerInput): Promise<Customer>;
  update(id: string, input: UpdateCustomerInput): Promise<Customer>;
  getAll(): Promise<Customer[]>;
}

export interface IBookingRepository {
  findAll(query?: BookingFilters): Promise<PaginatedResult<Booking>>;
  findById(id: string): Promise<Booking | null>;
  create(input: CreateBookingInput): Promise<Booking>;
  update(id: string, input: UpdateBookingInput): Promise<Booking>;
  getAll(): Promise<Booking[]>;
  findByCustomerId(customerId: string): Promise<Booking[]>;
}

export interface ISettingsRepository {
  get(): Promise<HotelSettings>;
  update(input: UpdateHotelSettingsInput): Promise<HotelSettings>;
}
