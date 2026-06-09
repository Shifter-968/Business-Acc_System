import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@pestel/shared';

export class CreateUserDto {
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

    @ApiPropertyOptional({ enum: UserRole, default: UserRole.ACCOUNTANT })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole = UserRole.ACCOUNTANT;
}
