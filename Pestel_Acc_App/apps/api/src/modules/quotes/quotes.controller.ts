import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, QuoteStatus } from '@pestel/shared';

@ApiTags('Quotes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Create a new quote' })
  create(@Body() dto: CreateQuoteDto, @CurrentUser() user: { id: string }) {
    return this.quotesService.create(dto, user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.VIEWER)
  @ApiOperation({ summary: 'List all quotes' })
  @ApiQuery({ name: 'status', enum: QuoteStatus, required: false })
  @ApiQuery({ name: 'clientId', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.quotesService.findAll({ status, clientId });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.VIEWER)
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  update(@Param('id') id: string, @Body() dto: UpdateQuoteDto) {
    return this.quotesService.update(id, dto);
  }

  @Post(':id/send')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Mark quote as SENT' })
  send(@Param('id') id: string) {
    return this.quotesService.send(id);
  }

  @Post(':id/convert')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Convert quote to invoice' })
  convert(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.quotesService.convert(id, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.quotesService.remove(id);
  }
}

