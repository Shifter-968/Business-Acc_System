import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import Decimal from 'decimal.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// ─────────────────────────────────────────────────────────────────────────────
// TEACHING NOTE — Reports module
//
// There are three reports:
//   1. Profit & Loss  — Income (invoices) vs Expenses in a date range
//   2. Aged Debtors   — Outstanding invoices grouped by how old they are
//   3. Balance Sheet  — Simplified assets vs liabilities snapshot
//
// Each report has:
//   • A JSON endpoint (for rendering in the browser)
//   • An XLSX export (real Excel file download)
//   • A PDF export  (printable summary via pdfkit)
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

  // ── 1. Profit & Loss ────────────────────────────────────────────────────────
  async profitLoss(from: string, to: string) {
    const start = new Date(from);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    // Income = total of all PAID invoices in the period
    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: { in: ['PAID', 'SENT', 'PARTIALLY_PAID'] },
        issueDate: { gte: start, lte: end },
      },
      select: { subtotal: true, vatAmount: true, total: true, status: true },
    });

    const expenses = await this.prisma.expense.findMany({
      where: { date: { gte: start, lte: end } },
      select: { subtotal: true, vatAmount: true, total: true, category: true },
    });

    const totalIncome = invoices.reduce(
      (sum, inv) => sum.add(new Decimal(inv.total.toString())),
      new Decimal(0),
    );

    const totalExpenses = expenses.reduce(
      (sum, exp) => sum.add(new Decimal(exp.total.toString())),
      new Decimal(0),
    );

    // Group expenses by category
    const byCategory: Record<string, number> = {};
    for (const exp of expenses) {
      const cat = exp.category ?? 'Other';
      byCategory[cat] = (byCategory[cat] ?? 0) + Number(exp.total);
    }

    const netProfit = totalIncome.sub(totalExpenses);

    return {
      period: { from, to },
      income: {
        total: totalIncome.toDecimalPlaces(2).toNumber(),
        invoiceCount: invoices.length,
      },
      expenses: {
        total: totalExpenses.toDecimalPlaces(2).toNumber(),
        byCategory,
        expenseCount: expenses.length,
      },
      netProfit: netProfit.toDecimalPlaces(2).toNumber(),
      profitMargin:
        totalIncome.isZero()
          ? 0
          : netProfit.div(totalIncome).mul(100).toDecimalPlaces(2).toNumber(),
    };
  }

  // ── 2. Aged Debtors ─────────────────────────────────────────────────────────
  async agedDebtors() {
    const now = new Date();
    const outstanding = await this.prisma.invoice.findMany({
      where: { status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] } },
      include: { client: { select: { id: true, name: true } } },
    });

    const buckets: Record<string, { client: string; invoiceNumber: string; total: number; amountDue: number; daysOverdue: number }[]> = {
      current: [],
      '1-30': [],
      '31-60': [],
      '61-90': [],
      '90+': [],
    };

    for (const inv of outstanding) {
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24),
      );
      const row = {
        client: inv.client.name,
        invoiceNumber: inv.invoiceNumber,
        total: Number(inv.total),
        amountDue: Number(inv.amountDue),
        daysOverdue,
      };
      if (daysOverdue <= 0) buckets['current'].push(row);
      else if (daysOverdue <= 30) buckets['1-30'].push(row);
      else if (daysOverdue <= 60) buckets['31-60'].push(row);
      else if (daysOverdue <= 90) buckets['61-90'].push(row);
      else buckets['90+'].push(row);
    }

    const totals: Record<string, number> = {};
    for (const key of Object.keys(buckets)) {
      totals[key] = buckets[key].reduce((s, r) => s + r.amountDue, 0);
    }

    return {
      generatedAt: now.toISOString(),
      buckets,
      totals,
      grandTotal: Object.values(totals).reduce((s, v) => s + v, 0),
    };
  }

  // ── 3. Balance Sheet (simplified) ───────────────────────────────────────────
  async balanceSheet(date: string) {
    const asAt = new Date(date);
    asAt.setHours(23, 59, 59, 999);

    // Receivables = outstanding invoice amounts as at date
    const outstanding = await this.prisma.invoice.aggregate({
      where: {
        status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
        issueDate: { lte: asAt },
      },
      _sum: { amountDue: true },
    });

    // Cash collected = payments received up to date
    const cashCollected = await this.prisma.payment.aggregate({
      where: { paymentDate: { lte: asAt } },
      _sum: { amount: true },
    });

    // Total expenses paid = expense total up to date
    const totalExpenses = await this.prisma.expense.aggregate({
      where: { date: { lte: asAt } },
      _sum: { total: true },
    });

    const receivables = Number(outstanding._sum.amountDue ?? 0);
    const cash = Number(cashCollected._sum.amount ?? 0);
    const expenses = Number(totalExpenses._sum.total ?? 0);
    const totalAssets = receivables + cash;
    const equity = totalAssets - expenses;

    return {
      asAt: date,
      assets: {
        accountsReceivable: receivables,
        cash,
        total: totalAssets,
      },
      liabilities: {
        total: 0, // requires full double-entry for accurate liabilities
      },
      equity: {
        retainedEarnings: equity,
        total: equity,
      },
      note: 'Simplified balance sheet. Enable full journal entries for GAAP-compliant reporting.',
    };
  }

  // ── XLSX Export ──────────────────────────────────────────────────────────────
  async exportXlsx(type: 'profit-loss' | 'aged-debtors' | 'balance-sheet', params: Record<string, string>): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Fannie Logistics';
    workbook.created = new Date();

    if (type === 'profit-loss') {
      const data = await this.profitLoss(params.from, params.to);
      const sheet = workbook.addWorksheet('Profit & Loss');

      // Header styling
      sheet.mergeCells('A1:C1');
      sheet.getCell('A1').value = 'Fannie Logistics — Profit & Loss Statement';
      sheet.getCell('A1').font = { bold: true, size: 14 };
      sheet.getCell('A2').value = `Period: ${params.from} to ${params.to}`;
      sheet.getCell('A2').font = { italic: true };

      sheet.addRow([]);
      sheet.addRow(['Description', '', 'Amount (ZAR)']).font = { bold: true };
      sheet.addRow(['INCOME', '', '']);
      sheet.addRow(['  Total Invoice Revenue', '', data.income.total]);
      sheet.addRow([]);
      sheet.addRow(['EXPENSES', '', '']);
      for (const [cat, amt] of Object.entries(data.expenses.byCategory)) {
        sheet.addRow([`  ${cat}`, '', amt]);
      }
      sheet.addRow(['  Total Expenses', '', data.expenses.total]).font = { bold: true };
      sheet.addRow([]);
      const netRow = sheet.addRow(['NET PROFIT', '', data.netProfit]);
      netRow.font = { bold: true };
      netRow.getCell(3).numFmt = 'R#,##0.00';
      sheet.getColumn(3).numFmt = 'R#,##0.00';
      sheet.getColumn(1).width = 35;
      sheet.getColumn(3).width = 20;
    }

    if (type === 'aged-debtors') {
      const data = await this.agedDebtors();
      const sheet = workbook.addWorksheet('Aged Debtors');

      sheet.mergeCells('A1:E1');
      sheet.getCell('A1').value = 'Fannie Logistics — Aged Debtors';
      sheet.getCell('A1').font = { bold: true, size: 14 };
      sheet.getCell('A2').value = `Generated: ${new Date().toLocaleDateString('en-ZA')}`;

      sheet.addRow([]);
      const header = sheet.addRow(['Invoice #', 'Client', 'Total', 'Amount Due', 'Days Overdue']);
      header.font = { bold: true };
      header.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; });

      for (const [bucket, rows] of Object.entries(data.buckets)) {
        if ((rows as unknown[]).length === 0) continue;
        const bucketRow = sheet.addRow([`— ${bucket} days —`, '', '', '', '']);
        bucketRow.font = { bold: true, italic: true };
        for (const row of rows as { invoiceNumber: string; client: string; total: number; amountDue: number; daysOverdue: number }[]) {
          sheet.addRow([row.invoiceNumber, row.client, row.total, row.amountDue, row.daysOverdue]);
        }
      }
      sheet.addRow([]);
      const totalRow = sheet.addRow(['TOTAL', '', '', data.grandTotal, '']);
      totalRow.font = { bold: true };
      totalRow.getCell(4).numFmt = 'R#,##0.00';

      sheet.getColumn(1).width = 18;
      sheet.getColumn(2).width = 28;
      sheet.getColumn(3).width = 15;
      sheet.getColumn(4).width = 15;
      sheet.getColumn(5).width = 14;
      sheet.getColumn(3).numFmt = 'R#,##0.00';
      sheet.getColumn(4).numFmt = 'R#,##0.00';
    }

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  // ── PDF Export ───────────────────────────────────────────────────────────────
  async exportPdf(type: 'profit-loss' | 'aged-debtors', params: Record<string, string>): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text('Fannie Logistics', { align: 'left' });
      doc.moveDown(0.3);

      if (type === 'profit-loss') {
        const data = await this.profitLoss(params.from, params.to);
        doc.fontSize(14).text('Profit & Loss Statement');
        doc.fontSize(10).font('Helvetica').text(`Period: ${params.from} to ${params.to}`);
        doc.moveDown();

        doc.font('Helvetica-Bold').fontSize(12).text('INCOME');
        doc.font('Helvetica').fontSize(10);
        doc.text(`Total Invoice Revenue: R ${data.income.total.toFixed(2)}`);
        doc.moveDown(0.5);

        doc.font('Helvetica-Bold').fontSize(12).text('EXPENSES');
        doc.font('Helvetica').fontSize(10);
        for (const [cat, amt] of Object.entries(data.expenses.byCategory)) {
          doc.text(`  ${cat}: R ${(amt as number).toFixed(2)}`);
        }
        doc.text(`Total Expenses: R ${data.expenses.total.toFixed(2)}`);
        doc.moveDown(0.5);

        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`NET PROFIT: R ${data.netProfit.toFixed(2)}`);
        doc.text(`Profit Margin: ${data.profitMargin.toFixed(1)}%`);
      }

      if (type === 'aged-debtors') {
        const data = await this.agedDebtors();
        doc.fontSize(14).text('Aged Debtors Report');
        doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString('en-ZA')}`);
        doc.moveDown();

        for (const [bucket, rows] of Object.entries(data.buckets)) {
          if ((rows as unknown[]).length === 0) continue;
          doc.font('Helvetica-Bold').fontSize(11).text(`${bucket} days`);
          doc.font('Helvetica').fontSize(9);
          for (const row of rows as { invoiceNumber: string; client: string; amountDue: number; daysOverdue: number }[]) {
            doc.text(`  ${row.invoiceNumber}  |  ${row.client}  |  Due: R ${row.amountDue.toFixed(2)}  |  ${row.daysOverdue} days`);
          }
          doc.moveDown(0.3);
        }

        doc.font('Helvetica-Bold').fontSize(11);
        doc.text(`Grand Total Outstanding: R ${data.grandTotal.toFixed(2)}`);
      }

      doc.end();
    });
  }
}

