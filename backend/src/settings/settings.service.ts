import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const existing = await this.prisma.hotelSetting.findFirst();
    if (existing) return this.serialize(existing);

    const created = await this.prisma.hotelSetting.create({
      data: {
        hotelName: 'Cedar Ridge Lodge',
        logo: '',
        gstNumber: '27AABCU9603R1ZM',
        address: '12 Hill View Road, Lonavala, Maharashtra 410401',
        phone: '+919876543210',
        email: 'front.desk@cedarridgelodge.com',
        currency: 'INR',
      },
    });
    return this.serialize(created);
  }

  async update(dto: UpdateSettingsDto) {
    const current = await this.get();
    const updated = await this.prisma.hotelSetting.update({
      where: { id: current.id },
      data: dto,
    });
    return this.serialize(updated);
  }

  private serialize(row: {
    id: string;
    hotelName: string;
    logo: string | null;
    gstNumber: string;
    address: string;
    phone: string;
    email: string;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: row.id,
      hotelName: row.hotelName,
      logo: row.logo ?? '',
      gstNumber: row.gstNumber,
      address: row.address,
      phone: row.phone,
      email: row.email,
      currency: row.currency,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
