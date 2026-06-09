import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ enum: ['FINANCE', 'READ_ONLY'], default: 'FINANCE' })
  @IsOptional()
  @IsIn(['FINANCE', 'READ_ONLY'])
  accessLevel?: 'FINANCE' | 'READ_ONLY' = 'FINANCE';
}