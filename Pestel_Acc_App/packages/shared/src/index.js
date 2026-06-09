// Runtime exports for Node.js consumers. Keep in sync with src/index.ts enums.

const UserRole = {
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  VIEWER: 'VIEWER',
};

const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  VOID: 'VOID',
  OVERDUE: 'OVERDUE',
};

const QuoteStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  CONVERTED: 'CONVERTED',
};

const PaymentMethod = {
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
  CHEQUE: 'CHEQUE',
  CREDIT_CARD: 'CREDIT_CARD',
  EFT: 'EFT',
};

const AccountType = {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  EQUITY: 'EQUITY',
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
};

const JournalEntryType = {
  INVOICE: 'INVOICE',
  PAYMENT: 'PAYMENT',
  EXPENSE: 'EXPENSE',
  MANUAL: 'MANUAL',
  REVERSAL: 'REVERSAL',
};

module.exports = {
  UserRole,
  InvoiceStatus,
  QuoteStatus,
  PaymentMethod,
  AccountType,
  JournalEntryType,
};
