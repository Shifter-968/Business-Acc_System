import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteStatus, InvoiceStatus } from '@pestel/shared';
import Decimal from 'decimal.js';

function calcLine(qty: number, unit: number, vatRate: number) {
  const q = new Decimal(qty);
  const u = new Decimal(unit);
  const v = new Decimal(vatRate).div(100);
  const subtotal = q.mul(u);
  const vatAmount = subtotal.mul(v).toDecimalPlaces(2);
  const total = subtotal.add(vatAmount).toDecimalPlaces(2);
  return {
    subtotal: subtotal.toDecimalPlaces(2).toNumber(),
    vatAmount: vatAmount.toNumber(),
    total: total.toNumber(),
  };
}

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuoteDto, userId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Client not found');

    const settings = await this.prisma.companySettings.findFirst();
    const prefix = settings?.quotePrefix ?? 'QUO';
    const nextNo = settings?.nextQuoteNo ?? 1;
    const defaultVat = settings?.vatRate ? Number(settings.vatRate) : 15;

    let grandSubtotal = new Decimal(0);
    let grandVat = new Decimal(0);

    const itemsWithCalc = dto.items.map((item, idx) => {
      const vatRate = item.vatRate ?? defaultVat;
      const { subtotal, vatAmount, total } = calcLine(item.quantity, item.unitPrice, vatRate);
      grandSubtotal = grandSubtotal.add(subtotal);
      grandVat = grandVat.add(vatAmount);
      return { ...item, vatRate, vatAmount, total, sortOrder: item.sortOrder ?? idx };
    });

    const grandTotal = grandSubtotal.add(grandVat).toDecimalPlaces(2).toNumber();
    const quoteNumber = `${prefix}-${String(nextNo).padStart(4, '0')}`;

    const quote = await this.prisma.$transaction(async (tx) => {
      const created = await tx.quote.create({
        data: {
          quoteNumber,
          clientId: dto.clientId,
          expiryDate: new Date(dto.expiryDate),
          terms: dto.terms,
          notes: dto.notes,
          subtotal: grandSubtotal.toNumber(),
          vatAmount: grandVat.toDecimalPlaces(2).toNumber(),
          total: grandTotal,
          createdById: userId,
          items: {
            create: itemsWithCalc.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              vatRate: item.vatRate,
              vatAmount: item.vatAmount,
              total: item.total,
              sortOrder: item.sortOrder,
            })),
          },
        },
        include: { client: { select: { id: true, name: true } }, items: true },
      });

      await tx.companySettings.updateMany({
        data: { nextQuoteNo: { increment: 1 } },
      });

      return created;
    });

    return quote;
  }

  async findAll(params?: { status?: string; clientId?: string }) {
    return this.prisma.quote.findMany({
      where: {
        ...(params?.status ? { status: params.status as QuoteStatus } : {}),
        ...(params?.clientId ? { clientId: params.clientId } : {}),
      },
      include: {
        client: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        client: true,
        items: { orderBy: { sortOrder: 'asc' } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  async update(id: string, dto: UpdateQuoteDto) {
    const quote = await this.findOne(id);
    if (quote.status !== QuoteStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT quotes can be edited.');
    }

    const settings = await this.prisma.companySettings.findFirst();
    const defaultVat = settings?.vatRate ? Number(settings.vatRate) : 15;

    let updateData: Record<string, unknown> = {};
    if (dto.clientId) updateData.clientId = dto.clientId;
    if (dto.expiryDate) updateData.expiryDate = new Date(dto.expiryDate);
    if (dto.terms !== undefined) updateData.terms = dto.terms;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    if (dto.items) {
      let grandSubtotal = new Decimal(0);
      let grandVat = new Decimal(0);

      const itemsWithCalc = dto.items.map((item, idx) => {
        const vatRate = item.vatRate ?? defaultVat;
        const { subtotal, vatAmount, total } = calcLine(item.quantity, item.unitPrice, vatRate);
        grandSubtotal = grandSubtotal.add(subtotal);
        grandVat = grandVat.add(vatAmount);
        return { ...item, vatRate, vatAmount, total, sortOrder: item.sortOrder ?? idx };
      });

      await this.prisma.quoteItem.deleteMany({ where: { quoteId: id } });
      updateData.subtotal = grandSubtotal.toNumber();
      updateData.vatAmount = grandVat.toDecimalPlaces(2).toNumber();
      updateData.total = grandSubtotal.add(grandVat).toDecimalPlaces(2).toNumber();
      updateData.items = {
        create: itemsWithCalc.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          vatAmount: item.vatAmount,
          total: item.total,
          sortOrder: item.sortOrder,
        })),
      };
    }

    return this.prisma.quote.update({ where: { id }, data: updateData });
  }

  async send(id: string) {
    const quote = await this.findOne(id);
    if (quote.status !== QuoteStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT quotes can be sent.');
    }
    return this.prisma.quote.update({
      where: { id },
      data: { status: QuoteStatus.SENT, sentAt: new Date() },
    });
  }

  // Convert a SENT/ACCEPTED quote into an Invoice
  async convert(id: string, userId: string) {
    const quote = await this.findOne(id);
    if (
      quote.status !== QuoteStatus.SENT &&
      quote.status !== QuoteStatus.ACCEPTED
    ) {
      throw new BadRequestException('Only SENT or ACCEPTED quotes can be converted.');
    }

    const settings = await this.prisma.companySettings.findFirst();
    const prefix = settings?.invoicePrefix ?? 'INV';
    const nextNo = settings?.nextInvoiceNo ?? 1;
    const invoiceNumber = `${prefix}-${String(nextNo).padStart(4, '0')}`;

    // Default due date = 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          clientId: quote.clientId,
          dueDate,
          terms: quote.terms,
          notes: quote.notes,
          subtotal: quote.subtotal,
          vatAmount: quote.vatAmount,
          total: quote.total,
          amountDue: quote.total,
          createdById: userId,
          items: {
            create: quote.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              vatRate: item.vatRate,
              vatAmount: item.vatAmount,
              total: item.total,
              sortOrder: item.sortOrder,
            })),
          },
        },
        include: { client: { select: { id: true, name: true } } },
      });

      await tx.quote.update({
        where: { id },
        data: {
          status: QuoteStatus.CONVERTED,
          convertedAt: new Date(),
          invoiceId: invoice.id,
        },
      });

      await tx.companySettings.updateMany({
        data: { nextInvoiceNo: { increment: 1 } },
      });

      return invoice;
    });
  }

  async remove(id: string) {
    const quote = await this.findOne(id);
    if (quote.status !== QuoteStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT quotes can be deleted.');
    }
    return this.prisma.quote.delete({ where: { id } });
  }
}

