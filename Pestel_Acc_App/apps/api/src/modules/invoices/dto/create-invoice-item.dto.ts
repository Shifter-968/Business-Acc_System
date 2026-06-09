// ─── CreateInvoiceItemDto ─────────────────────────────────────────────────────
//
// TEACHING NOTE:
// An invoice item is one line on the invoice, e.g.:
//   "Website design  x 1  @ R5,000 = R5,000 (+ R750 VAT)"
//
// Fields:
//   description  — what the work/product is
//   quantity     — how many units (can be 0.5 for half-day, etc.)
//   unitPrice    — price per unit
//   vatRate      — tax rate for this line (default 15% in South Africa)
//   sortOrder    — controls display order on the invoice
//
// Decorators explained:
//   @IsString()   — value must be text
//   @IsNumber()   — value must be a number
//   @Min(0)       — value must be 0 or above (no negatives)
//   @IsOptional() — field does not have to be included
// ─────────────────────────────────────────────────────────────────────────────

import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'Brand campaign creative design' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: 5000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 15, description: 'VAT percentage — default 15%' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  vatRate?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}
