// ─── InvoicesController ───────────────────────────────────────────────────────
//
// TEACHING NOTE — What is a Controller?
// A controller is the "front door" of a feature.
// It maps HTTP requests (GET, POST, PATCH, DELETE) to service methods.
//
// Think of it like a receptionist:
//   Visitor says: "POST /invoices"       → receptionist calls InvoicesService.create()
//   Visitor says: "GET /invoices/abc123" → receptionist calls InvoicesService.findOne("abc123")
//
// Security decorators explained:
//   @UseGuards(AuthGuard('jwt'))  — "You must be logged in (have a valid token)"
//   @UseGuards(RolesGuard)        — "You must have the right role"
//   @Roles(ADMIN, ACCOUNTANT)     — "Only admins or accountants can do this"
//   @CurrentUser()                — Extracts the logged-in user from the request
//   @ApiBearerAuth()              — Tells Swagger UI: this endpoint needs a token
// ─────────────────────────────────────────────────────────────────────────────

import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, InvoiceStatus } from '@pestel/shared';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  // POST /invoices — Create a new invoice
  // Only admins and accountants can create invoices (not viewers)
  // @CurrentUser() gives us the logged-in user so we can record who created it
  @Post()
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Create a new invoice' })
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: { id: string }) {
    return this.invoicesService.create(dto, user.id);
  }

  // GET /invoices — List all invoices (optional: ?status=OVERDUE&clientId=xxx)
  @Get()
  @ApiOperation({ summary: 'List all invoices, optionally filtered by status or client' })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiQuery({ name: 'clientId', required: false })
  findAll(
    @Query('status') status?: InvoiceStatus,
    @Query('clientId') clientId?: string,
  ) {
    return this.invoicesService.findAll({ status, clientId });
  }

  // GET /invoices/:id — Get a single invoice with all its items
  @Get(':id')
  @ApiOperation({ summary: 'Get full invoice details (with items and payments)' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  // PATCH /invoices/:id — Edit an invoice (only DRAFT)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Update a DRAFT invoice' })
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, dto);
  }

  // POST /invoices/:id/send — Send the invoice to the client
  // TEACHING: This is a custom action (not a CRUD). We use POST on a sub-route.
  @Post(':id/send')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Mark invoice as SENT (moves from DRAFT → SENT)' })
  send(@Param('id') id: string) {
    return this.invoicesService.send(id);
  }

  // POST /invoices/:id/void — Cancel an invoice
  @Post(':id/void')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Void (cancel) an invoice' })
  voidInvoice(@Param('id') id: string) {
    return this.invoicesService.voidInvoice(id);
  }

  // DELETE /invoices/:id — Permanently delete a DRAFT invoice
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a DRAFT invoice (Admin only)' })
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}
