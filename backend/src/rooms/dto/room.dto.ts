import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Family', 'Executive'] as const;
const ROOM_STATUSES = ['available', 'occupied', 'cleaning', 'maintenance'] as const;

export class CreateRoomDto {
  @ApiProperty({ example: '101' })
  @IsString()
  roomNumber!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  floor!: number;

  @ApiProperty({ enum: ROOM_TYPES })
  @IsEnum(ROOM_TYPES)
  roomType!: (typeof ROOM_TYPES)[number];

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty({ example: 3500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ enum: ROOM_STATUSES })
  @IsOptional()
  @IsEnum(ROOM_STATUSES)
  status?: (typeof ROOM_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
