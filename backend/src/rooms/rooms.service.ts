import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma, RoomStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import {
  mapRoomStatus,
  mapRoomType,
  paginated,
  parseHotelDate,
  parseRoomStatus,
  parseRoomType,
  toNumber,
} from '../common/utils/mappers';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { search?: string; page?: number; pageSize?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.pageSize ?? query.limit) || 20);
    const search = query.search?.trim();

    const where: Prisma.RoomWhereInput = search
      ? { roomNumber: { contains: search, mode: 'insensitive' } }
      : {};

    const [total, rooms] = await this.prisma.$transaction([
      this.prisma.room.count({ where }),
      this.prisma.room.findMany({
        where,
        orderBy: { roomNumber: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return paginated(rooms.map((room) => this.serialize(room)), total, page, limit);
  }

  async getAll() {
    const rooms = await this.prisma.room.findMany({ orderBy: { roomNumber: 'asc' } });
    return rooms.map((room) => this.serialize(room));
  }

  async findById(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    return this.serialize(room);
  }

  async available(checkIn: string, checkOut: string) {
    const start = parseHotelDate(checkIn);
    const end = parseHotelDate(checkOut);
    if (end <= start) {
      throw new ConflictException('Check-out must be after check-in');
    }

    const overlapping = await this.prisma.booking.findMany({
      where: {
        status: { in: [BookingStatus.BOOKED, BookingStatus.CHECKED_IN] },
        checkIn: { lt: end },
        checkOut: { gt: start },
      },
      select: { roomId: true },
    });
    const busyIds = overlapping.map((b) => b.roomId);

    const rooms = await this.prisma.room.findMany({
      where: {
        ...(busyIds.length ? { id: { notIn: busyIds } } : {}),
        status: { notIn: [RoomStatus.MAINTENANCE] },
      },
      orderBy: { roomNumber: 'asc' },
    });

    return rooms.map((room) => this.serialize(room));
  }

  async create(dto: CreateRoomDto) {
    const existing = await this.prisma.room.findUnique({
      where: { roomNumber: dto.roomNumber.trim() },
    });
    if (existing) {
      throw new ConflictException(`Room ${dto.roomNumber} already exists`);
    }

    const room = await this.prisma.room.create({
      data: {
        roomNumber: dto.roomNumber.trim(),
        floor: dto.floor,
        roomType: parseRoomType(dto.roomType),
        capacity: dto.capacity,
        price: dto.price,
        status: dto.status ? parseRoomStatus(dto.status) : RoomStatus.AVAILABLE,
        description: dto.description,
      },
    });
    return this.serialize(room);
  }

  async update(id: string, dto: UpdateRoomDto) {
    await this.findById(id);
    if (dto.roomNumber) {
      const clash = await this.prisma.room.findFirst({
        where: { roomNumber: dto.roomNumber.trim(), id: { not: id } },
      });
      if (clash) {
        throw new ConflictException(`Room ${dto.roomNumber} already exists`);
      }
    }

    const room = await this.prisma.room.update({
      where: { id },
      data: {
        roomNumber: dto.roomNumber?.trim(),
        floor: dto.floor,
        roomType: dto.roomType ? parseRoomType(dto.roomType) : undefined,
        capacity: dto.capacity,
        price: dto.price,
        status: dto.status ? parseRoomStatus(dto.status) : undefined,
        description: dto.description,
      },
    });
    return this.serialize(room);
  }

  async remove(id: string) {
    await this.findById(id);
    const active = await this.prisma.booking.count({
      where: {
        roomId: id,
        status: { in: [BookingStatus.BOOKED, BookingStatus.CHECKED_IN] },
      },
    });
    if (active > 0) {
      throw new ConflictException('Cannot delete a room with active bookings');
    }
    await this.prisma.room.delete({ where: { id } });
  }

  serialize(room: {
    id: string;
    roomNumber: string;
    floor: number;
    roomType: Prisma.RoomGetPayload<{ select: { roomType: true } }>['roomType'] | string;
    capacity: number;
    price: Prisma.Decimal | number;
    status: Prisma.RoomGetPayload<{ select: { status: true } }>['status'] | string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      roomType: mapRoomType(room.roomType as never),
      capacity: room.capacity,
      price: toNumber(room.price),
      status: mapRoomStatus(room.status as never),
      description: room.description ?? undefined,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
    };
  }
}
