// ─── InvoicesService ──────────────────────────────────────────────────────────
//
// TEACHING NOTE — What is a Service?
// A service contains the BUSINESS LOGIC of a feature.
// Think of it as the brain behind every operation.
//
// Rule: Controllers (the door) just pass data in and out.
//       Services (the brain) decide what to DO with that data.
//
// In this service we handle:
//   1. create()       — build a new invoice from items, calculate totals, auto-number it
//   2. findAll()      — list invoices with optional filters
//   3. findOne()      — get one invoice with all its items
//   4. update()       — change notes, due date, or items (only on DRAFT invoices)
//   5. send()         — mark it as SENT (moves it from draft to billable)
//   6. recordPayment()— reduce the amount due when client pays
//   7. voidInvoice()  — cancel the invoice
//   8. remove()       — delete a DRAFT invoice
//
// ─────────────────────────────────────────────────────────────────────────────

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceStatus } from '@pestel/shared';
import Decimal from 'decimal.js';

// ─── Helper: calculate line totals ───────────────────────────────────────────
// TEACHING: For each line item, we compute:
//   vatAmount = quantity × unitPrice × (vatRate / 100)
//   total     = quantity × unitPrice + vatAmount
//
// We use Decimal.js (a safe math library) because JavaScript floats have
// rounding bugs. Example: 0.1 + 0.2 = 0.30000000000000004 in plain JS.
// Decimal.js gives us: 0.1 + 0.2 = 0.3 exactly.
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
export class InvoicesService {
  constructor(private prisma: PrismaService) { }

  // ──────────────────────────────────────────────────────────────────────────
  // CREATE — Build a new invoice
  // ──────────────────────────────────────────────────────────────────────────
  // TEACHING FLOW:
  //   1. Validate client exists
  //   2. Get company settings to read VAT rate and next invoice number
  //   3. Calculate totals from every line item
  //   4. Create invoice + items inside a Prisma "transaction"
  //      (transaction = if anything fails, nothing is saved — keeps data clean)
  //   5. Update the next invoice number counter in settings
  // ──────────────────────────────────────────────────────────────────────────
  async create(dto: CreateInvoiceDto, userId: string) {
    // Step 1: Make sure the client exists
    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Client not found');

    // Step 2: Load company settings for invoice prefix, number, and default VAT
    const settings = await this.prisma.companySettings.findFirst();
    const prefix = settings?.invoicePrefix ?? 'INV';
    const nextNo = settings?.nextInvoiceNo ?? 1;
    const defaultVat = settings?.vatRate ? Number(settings.vatRate) : 15;

    // Step 3: Calculate line totals
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
    const invoiceNumber = `${prefix}-${String(nextNo).padStart(4, '0')}`;

    // Step 4: Save everything inside a database transaction
    const invoice = await this.prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          invoiceNumber,
          clientId: dto.clientId,
          dueDate: new Date(dto.dueDate),
          terms: dto.terms,
          notes: dto.notes,
          subtotal: grandSubtotal.toNumber(),
          vatAmount: grandVat.toDecimalPlaces(2).toNumber(),
          total: grandTotal,
          amountDue: grandTotal,
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
        include: { items: true, client: { select: { id: true, name: true } } },
      });

      // Step 5: Increment invoice number counter
      if (settings) {
        await tx.companySettings.update({
          where: { id: settings.id },
          data: { nextInvoiceNo: { increment: 1 } },
        });
      }
      return created;
    });

    return invoice;
  }

  // Extend invoice creation to include trip revenue
  async createTripInvoice(dto: CreateInvoiceDto & { tripId: string }, userId: string) {
    const enriched: CreateInvoiceDto = {
      ...dto,
      notes: dto.notes ? `[Trip ${dto.tripId}] ${dto.notes}` : `[Trip ${dto.tripId}]`,
    };
    return this.create(enriched, userId);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FIND ALL — List invoices (with optional filters)
  // ──────────────────────────────────────────────────────────────────────────
  // TEACHING: You can filter by status (e.g. only show "OVERDUE" invoices)
  // or by clientId. The & means both are optional — send neither, one, or both.
  // ──────────────────────────────────────────────────────────────────────────
  findAll(filters?: { status?: InvoiceStatus; clientId?: string }) {
    return this.prisma.invoice.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.clientId && { clientId: filters.clientId }),
      },
      include: {
        client: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FIND ONE — Get a single invoice with all items
  // ──────────────────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        items: { orderBy: { sortOrder: 'asc' } },
        payments: true,
        createdBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // UPDATE — Change notes, due date, or items (only while DRAFT)
  // ──────────────────────────────────────────────────────────────────────────
  // TEACHING: We protect sent/paid invoices from being edited because
  // changing a sent invoice would make records inconsistent.
  // Only DRAFT invoices can be freely changed.
  // ──────────────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.findOne(id);
    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT invoices can be edited.');
    }

    const { items, ...headerFields } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (items) {
        // Delete old items then recreate — simplest way to update a list
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

        const settings = await tx.companySettings.findFirst();
        const defaultVat = settings?.vatRate ? Number(settings.vatRate) : 15;

        let grandSubtotal = new Decimal(0);
        let grandVat = new Decimal(0);

        const newItems = items.map((item, idx) => {
          const vatRate = item.vatRate ?? defaultVat;
          const { subtotal, vatAmount, total } = calcLine(item.quantity!, item.unitPrice!, vatRate);
          grandSubtotal = grandSubtotal.add(subtotal);
          grandVat = grandVat.add(vatAmount);
          return {
            invoiceId: id,
            description: item.description!,
            quantity: item.quantity!,
            unitPrice: item.unitPrice!,
            vatRate,
            vatAmount,
            total,
            sortOrder: item.sortOrder ?? idx,
          };
        });

        await tx.invoiceItem.createMany({ data: newItems });
        const grandTotal = grandSubtotal.add(grandVat).toDecimalPlaces(2).toNumber();

        return tx.invoice.update({
          where: { id },
          data: {
            ...headerFields,
            ...(headerFields.dueDate && { dueDate: new Date(headerFields.dueDate) }),
            subtotal: grandSubtotal.toNumber(),
            vatAmount: grandVat.toDecimalPlaces(2).toNumber(),
            total: grandTotal,
            amountDue: grandTotal - Number(invoice.amountPaid),
          },
          include: { items: { orderBy: { sortOrder: 'asc' } }, client: true },
        });
      }

      return tx.invoice.update({
        where: { id },
        data: {
          ...headerFields,
          ...(headerFields.dueDate && { dueDate: new Date(headerFields.dueDate) }),
        },
        include: { items: { orderBy: { sortOrder: 'asc' } }, client: true },
      });
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SEND — Mark invoice as SENT (moves status from DRAFT → SENT)
  // ──────────────────────────────────────────────────────────────────────────
  // TEACHING: In accounting, "sending" an invoice means the client now
  // officially owes you the money. Before it's sent, it's just a draft —
  // it has no financial effect yet.
  // ──────────────────────────────────────────────────────────────────────────
  async send(id: string) {
    const invoice = await this.findOne(id);
    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException(`Invoice is already ${invoice.status} and cannot be re-sent.`);
    }
    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
      include: { client: true, items: true },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VOID — Cancel an invoice
  // ──────────────────────────────────────────────────────────────────────────
  // TEACHING: You never DELETE an invoice in accounting — that creates
  // missing numbers in the sequence (e.g. INV-0003 is gone — auditors panic).
  // Instead you VOID it, which cancels it but keeps the record.
  // ──────────────────────────────────────────────────────────────────────────
  async voidInvoice(id: string) {
    const invoice = await this.findOne(id);
    if (invoice.status === 'PAID') {
      throw new BadRequestException('Paid invoices cannot be voided. Create a credit note instead.');
    }
    if (invoice.status === 'VOID') {
      throw new BadRequestException('Invoice is already void.');
    }
    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'VOID', voidedAt: new Date() },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DELETE — Remove a DRAFT invoice (permanent)
  // ──────────────────────────────────────────────────────────────────────────
  async remove(id: string) {
    const invoice = await this.findOne(id);
    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT invoices can be permanently deleted.');
    }
    await this.prisma.invoice.delete({ where: { id } });
    return { message: 'Invoice deleted.' };
  }
}
