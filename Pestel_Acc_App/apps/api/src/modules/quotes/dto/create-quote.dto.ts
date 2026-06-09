import {
  IsString, IsDateString, IsOptional, ValidateNested, IsArray, ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateQuoteItemDto } from './create-quote-item.dto';

export class CreateQuoteDto {
  @ApiProperty({ example: 'clxyz123...', description: 'Client to quote' })
  @IsString()
  clientId: string;

  @ApiProperty({ example: '2026-06-15', description: 'Quote expiry date (ISO format)' })
  @IsDateString()
  expiryDate: string;

  @ApiPropertyOptional({ example: 'Valid for 30 days.' })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({ example: 'Includes revisions.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateQuoteItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'A quote must have at least one line item.' })
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items: CreateQuoteItemDto[];
}
