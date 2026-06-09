import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Adobe Creative Cloud subscription' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Software', description: 'Category e.g. Operations, Marketing, Travel, Software' })
  @IsString()
  category: string;

  @ApiProperty({ example: 1500.00, description: 'Amount excluding VAT' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: '2026-05-01', description: 'Date of the expense (ISO format)' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 15, description: 'VAT rate as a percentage (default 0)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  vatRate?: number;

  @ApiPropertyOptional({ example: 'INV-9921', description: 'Supplier invoice or receipt reference' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Optional supplier ID to link this expense' })
  @IsOptional()
  @IsString()
  supplierId?: string;
}
