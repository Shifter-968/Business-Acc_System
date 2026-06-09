import {
    Controller, Get, Post, Body, Patch, Param, Delete,
    UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@pestel/shared';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('clients')
export class ClientsController {
    constructor(private clientsService: ClientsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    @ApiOperation({ summary: 'Create a new customer billing account' })
    create(@Body() dto: CreateClientDto) {
        return this.clientsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all clients' })
    @ApiQuery({ name: 'search', required: false })
    findAll(@Query('search') search?: string) {
        return this.clientsService.findAll(search);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single client' })
    findOne(@Param('id') id: string) {
        return this.clientsService.findOne(id);
    }

    @Get(':id/balance')
    @ApiOperation({ summary: 'Get outstanding balance for a client' })
    getBalance(@Param('id') id: string) {
        return this.clientsService.getBalance(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    @ApiOperation({ summary: 'Update a client' })
    update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
        return this.clientsService.update(id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deactivate a client' })
    remove(@Param('id') id: string) {
        return this.clientsService.remove(id);
    }
}
