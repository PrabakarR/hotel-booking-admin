import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { paginated } from '../common/utils/mappers';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { search?: string; page?: number; pageSize?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.pageSize ?? query.limit) || 20);
    const search = query.search?.trim();

    const where: Prisma.CustomerWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { mobile: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, customers] = await this.prisma.$transaction([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { bookings: true } } },
      }),
    ]);

    return paginated(
      customers.map((customer) => this.serialize(customer, customer._count.bookings)),
      total,
      page,
      limit,
    );
  }

  async getAll() {
    const customers = await this.prisma.customer.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { bookings: true } } },
    });
    return customers.map((customer) => this.serialize(customer, customer._count.bookings));
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return this.serialize(customer, customer._count.bookings);
  }

  async create(dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name.trim(),
        mobile: dto.phone.trim(),
        email: dto.email?.trim() || null,
        address: dto.address.trim(),
        idProofType: dto.idProofType?.trim() || null,
        idProofNumber: dto.idProof.trim(),
      },
    });
    return this.serialize(customer, 0);
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findById(id);
    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        mobile: dto.phone?.trim(),
        email: dto.email === undefined ? undefined : dto.email.trim() || null,
        address: dto.address?.trim(),
        idProofType: dto.idProofType?.trim(),
        idProofNumber: dto.idProof?.trim(),
      },
      include: { _count: { select: { bookings: true } } },
    });
    return this.serialize(customer, customer._count.bookings);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.customer.delete({ where: { id } });
  }

  serialize(
    customer: {
      id: string;
      name: string;
      mobile: string;
      email: string | null;
      address: string;
      idProofType: string | null;
      idProofNumber: string;
      createdAt: Date;
      updatedAt: Date;
    },
    previousBookings = 0,
  ) {
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.mobile,
      mobile: customer.mobile,
      email: customer.email ?? undefined,
      address: customer.address,
      idProof: customer.idProofNumber,
      idProofType: customer.idProofType ?? undefined,
      idProofNumber: customer.idProofNumber,
      previousBookings,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }
}
