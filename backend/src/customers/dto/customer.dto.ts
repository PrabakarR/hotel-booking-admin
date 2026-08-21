import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ description: 'Mobile / phone number' })
  @IsString()
  @MinLength(8)
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'ID proof number (Aadhaar, PAN, passport, etc.)' })
  @IsString()
  @MinLength(4)
  idProof!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idProofType?: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  address!: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
