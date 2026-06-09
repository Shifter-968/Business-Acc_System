import {
    Controller, Get, Post, Body, Patch, Param, Delete,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@pestel/shared';

class ApproveUserDto {
    @ApiPropertyOptional({ enum: UserRole })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new user (Admin only)' })
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'List all users (Admin only)' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get('pending')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'List users pending approval (Admin only)' })
    findPending() {
        return this.usersService.findPending();
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a user (Admin only)' })
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deactivate a user (Admin only)' })
    deactivate(@Param('id') id: string) {
        return this.usersService.deactivate(id);
    }

    @Patch(':id/approve')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Approve user registration, optionally overriding their role (Admin only)' })
    approve(@Param('id') id: string, @Body() dto: ApproveUserDto) {
        return this.usersService.approve(id, dto.role);
    }
}
