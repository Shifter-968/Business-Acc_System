// ─── Enums ────────────────────────────────────────────────────────────────────

export enum UserRole {
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  VIEWER = 'VIEWER',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  VOID = 'VOID',
  OVERDUE = 'OVERDUE',
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CONVERTED = 'CONVERTED',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  CREDIT_CARD = 'CREDIT_CARD',
  EFT = 'EFT',
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum JournalEntryType {
  INVOICE = 'INVOICE',
  PAYMENT = 'PAYMENT',
  EXPENSE = 'EXPENSE',
  MANUAL = 'MANUAL',
  REVERSAL = 'REVERSAL',
}

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface DateRangeQuery {
  from: string; // ISO date string
  to: string;   // ISO date string
}

// ─── Report Types ─────────────────────────────────────────────────────────────

export interface ProfitLossReport {
  period: { from: string; to: string };
  income: { account: string; amount: number }[];
  expenses: { account: string; amount: number }[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export interface BalanceSheetReport {
  date: string;
  assets: { account: string; balance: number }[];
  liabilities: { account: string; balance: number }[];
  equity: { account: string; balance: number }[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface AgedDebtorItem {
  clientId: string;
  clientName: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
  total: number;
}

export interface VatSummary {
  period: { from: string; to: string };
  outputVat: number;   // VAT collected on sales (invoices)
  inputVat: number;    // VAT paid on expenses
  netVat: number;      // outputVat - inputVat (amount owed to SARS)
}
