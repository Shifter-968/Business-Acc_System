import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@pestel/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('suppliers')
export class SuppliersController {
    constructor(private suppliersService: SuppliersService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    @ApiOperation({ summary: 'Create a new supplier' })
    create(@Body() dto: CreateSupplierDto) {
        return this.suppliersService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all suppliers' })
    @ApiQuery({ name: 'search', required: false })
    findAll(@Query('search') search?: string) {
        return this.suppliersService.findAll(search);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single supplier' })
    findOne(@Param('id') id: string) {
        return this.suppliersService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
    @ApiOperation({ summary: 'Update a supplier' })
    update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
        return this.suppliersService.update(id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deactivate a supplier' })
    remove(@Param('id') id: string) {
        return this.suppliersService.remove(id);
    }
}
