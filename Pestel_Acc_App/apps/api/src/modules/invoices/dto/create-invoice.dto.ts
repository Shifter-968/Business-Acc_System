// ─── CreateInvoiceDto ─────────────────────────────────────────────────────────
//
// TEACHING NOTE:
// This is the main shape of an invoice when you create one.
// Think of it as the "form" an accountant fills in:
//   - Who is the client?         → clientId
//   - When is it due?             → dueDate
//   - What are the line items?   → items[]
//   - Any special terms/notes?   → terms / notes
//
// The backend calculates subtotal, VAT, and total from the items.
// You never send the totals — the server always calculates them to prevent fraud.
//
// ValidateNested + @Type(() => CreateInvoiceItemDto) together mean:
// "items must be an array, and each element must match CreateInvoiceItemDto rules"
// ─────────────────────────────────────────────────────────────────────────────

import {
  IsString, IsDateString, IsOptional, ValidateNested, IsArray, ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'clxyz123...', description: 'ID of the client being billed' })
  @IsString()
  clientId: string;

  @ApiProperty({ example: '2026-06-01', description: 'Payment due date (ISO format)' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: 'Payment due within 30 days.' })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({ example: 'For Q2 campaign delivery.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateInvoiceItemDto], description: 'Line items on the invoice' })
  @IsArray()
  @ArrayMinSize(1, { message: 'An invoice must have at least one line item.' })
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
