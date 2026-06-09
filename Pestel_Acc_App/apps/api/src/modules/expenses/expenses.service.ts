import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import Decimal from 'decimal.js';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateExpenseDto, userId: string) {
    const vatRate = dto.vatRate ?? 0;
    const subtotal = new Decimal(dto.amount);
    const vatAmount = subtotal.mul(new Decimal(vatRate).div(100)).toDecimalPlaces(2);
    const total = subtotal.add(vatAmount).toDecimalPlaces(2);

    return this.prisma.expense.create({
      data: {
        description: dto.description,
        category: dto.category,
        date: new Date(dto.date),
        subtotal: subtotal.toNumber(),
        vatAmount: vatAmount.toNumber(),
        total: total.toNumber(),
        reference: dto.reference,
        notes: dto.notes,
        supplierId: dto.supplierId,
        createdById: userId,
      },
      include: { supplier: { select: { id: true, name: true } } },
    });
  }

  async createTruckingExpense(dto: CreateExpenseDto & { truckId: string; expenseType: 'fuel' | 'maintenance' }, userId: string) {
    const vatRate = dto.vatRate ?? 0;
    const subtotal = new Decimal(dto.amount);
    const vatAmount = subtotal.mul(new Decimal(vatRate).div(100)).toDecimalPlaces(2);
    const total = subtotal.add(vatAmount).toDecimalPlaces(2);

    return this.prisma.expense.create({
      data: {
        description: dto.description,
        category: dto.expenseType,
        date: new Date(dto.date),
        subtotal: subtotal.toNumber(),
        vatAmount: vatAmount.toNumber(),
        total: total.toNumber(),
        reference: dto.reference ?? `TRUCK:${dto.truckId}`,
        notes: dto.notes ?? `Truck expense for ${dto.truckId}`,
        supplierId: dto.supplierId,
        createdById: userId,
      },
      include: { supplier: { select: { id: true, name: true } } },
    });
  }

  async findAll(params?: { from?: string; to?: string; category?: string }) {
    return this.prisma.expense.findMany({
      where: {
        ...(params?.from || params?.to
          ? {
            date: {
              ...(params.from ? { gte: new Date(params.from) } : {}),
              ...(params.to ? { lte: new Date(params.to) } : {}),
            },
          }
          : {}),
        ...(params?.category ? { category: params.category } : {}),
      },
      include: {
        supplier: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        supplier: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto) {
    await this.findOne(id);

    let updateData: Record<string, unknown> = { ...dto };

    if (dto.amount !== undefined || dto.vatRate !== undefined) {
      const existing = await this.prisma.expense.findUnique({ where: { id } });
      const amount = dto.amount ?? Number(existing!.subtotal);
      const vatRate = dto.vatRate ?? 0;
      const subtotal = new Decimal(amount);
      const vatAmount = subtotal.mul(new Decimal(vatRate).div(100)).toDecimalPlaces(2);
      const total = subtotal.add(vatAmount).toDecimalPlaces(2);
      updateData = {
        ...updateData,
        subtotal: subtotal.toNumber(),
        vatAmount: vatAmount.toNumber(),
        total: total.toNumber(),
      };
    }

    if (dto.date) updateData.date = new Date(dto.date);
    delete updateData.amount;
    delete updateData.vatRate;

    return this.prisma.expense.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.expense.delete({ where: { id } });
  }
}

