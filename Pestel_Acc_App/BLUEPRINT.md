# Technical Blueprint — Legacy Accounting Draft

This document reflects the earlier advertising-accounting direction and is now superseded by FANNIE_LOGISTICS_BLUEPRINT.md for active implementation decisions.

**Project:** Fannie Logistics Platform  
**Status:** Superseded reference  
**Date:** April 23, 2026 draft retained for history

---

## 1. SYSTEM OVERVIEW

The client already has a website. This system is a **standalone accounting web application** that runs alongside it. It manages:

- Customer invoicing and trip quotations
- Supplier/vendor expenses
- Payment tracking
- VAT and tax records
- Financial reports (P&L, Balance Sheet, Trial Balance)
- Chart of Accounts (double-entry bookkeeping)

---

## 2. TECH STACK

| Layer           | Technology                        | Why                                      |
|-----------------|-----------------------------------|------------------------------------------|
| Frontend        | Next.js 14 (App Router)           | Fast, SEO-capable, full-stack ready      |
| UI Components   | Tailwind CSS + shadcn/ui          | Professional, accessible, fast to build  |
| Backend API     | NestJS (Node.js + TypeScript)     | Structured, enterprise-grade REST API    |
| Database        | PostgreSQL                        | Reliable, ACID-compliant for finance     |
| ORM             | Prisma                            | Type-safe DB queries, easy migrations    |
| Auth            | JWT (access + refresh tokens)     | Stateless, secure                        |
| PDF Generation  | @react-pdf/renderer               | Invoices and reports as PDF              |
| Email           | Nodemailer + HTML templates       | Send invoices, payment reminders         |
| File Storage    | Local FS (Phase 1) → S3 later     | Invoice attachments, docs                |
| Dev Environment | Docker + docker-compose           | PostgreSQL + API + Web in containers     |
| Monorepo        | Turborepo                         | Single repo for API + Web + Shared types |

---

## 3. MONOREPO STRUCTURE

```
pestel-acc-app/
├── apps/
│   ├── api/                    ← NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── clients/
│   │   │   │   ├── suppliers/
│   │   │   │   ├── accounts/       ← Chart of Accounts
│   │   │   │   ├── invoices/
│   │   │   │   ├── quotes/
│   │   │   │   ├── expenses/
│   │   │   │   ├── payments/
│   │   │   │   ├── journal/        ← Journal entries (double-entry)
│   │   │   │   ├── vat/
│   │   │   │   └── reports/
│   │   │   ├── prisma/
│   │   │   │   └── schema.prisma
│   │   │   ├── common/
│   │   │   │   ├── guards/
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   └── pipes/
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── web/                    ← Next.js Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   └── login/
│       │   │   ├── (dashboard)/
│       │   │   │   ├── dashboard/
│       │   │   │   ├── clients/
│       │   │   │   ├── suppliers/
│       │   │   │   ├── invoices/
│       │   │   │   ├── quotes/
│       │   │   │   ├── expenses/
│       │   │   │   ├── payments/
│       │   │   │   ├── accounts/
│       │   │   │   ├── vat/
│       │   │   │   └── reports/
│       │   ├── components/
│       │   │   ├── ui/             ← shadcn/ui components
│       │   │   ├── forms/
│       │   │   ├── tables/
│       │   │   └── charts/
│       │   ├── lib/
│       │   │   ├── api.ts          ← API client (fetch wrapper)
│       │   │   ├── auth.ts
│       │   │   └── utils.ts
│       │   └── types/
│       └── package.json
│
├── packages/
│   └── shared/                 ← Shared TypeScript types
│       ├── src/
│       │   ├── types/
│       │   └── constants/
│       └── package.json
│
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## 4. DATABASE SCHEMA (Entity Relationship Summary)

### Core Tables

```
users               — system users (accountants, admin, view-only)
clients             — customers who pay the company
suppliers           — vendors the company pays
accounts            — chart of accounts (assets, liabilities, income, expenses)
invoices            — bills sent to clients
invoice_items       — line items on each invoice
quotes              — estimates/proposals sent to clients
quote_items         — line items on each quote
expenses            — money spent by the company
payments            — payments received or made
journal_entries     — double-entry accounting records
journal_lines       — debit/credit lines per journal entry
vat_transactions    — VAT records linked to invoices/expenses
```

### Key Relationships

```
Client ──< Invoice ──< InvoiceItem
Invoice ──< Payment
Invoice ──< JournalEntry ──< JournalLines (debit/credit)
Expense ──< JournalEntry ──< JournalLines
Account ──< JournalLines (debit or credit side)
Quote ──> Invoice (when accepted, quote converts to invoice)
```

---

## 5. API ENDPOINT PLAN

### Auth
```
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
```

### Clients (Customers)
```
GET    /clients
POST   /clients
GET    /clients/:id
PATCH  /clients/:id
DELETE /clients/:id
GET    /clients/:id/invoices
GET    /clients/:id/balance
```

### Suppliers
```
GET    /suppliers
POST   /suppliers
GET    /suppliers/:id
PATCH  /suppliers/:id
DELETE /suppliers/:id
GET    /suppliers/:id/expenses
```

### Chart of Accounts
```
GET    /accounts
POST   /accounts
GET    /accounts/:id
PATCH  /accounts/:id
GET    /accounts/:id/ledger
```

### Invoices
```
GET    /invoices
POST   /invoices
GET    /invoices/:id
PATCH  /invoices/:id
POST   /invoices/:id/send          ← email invoice to client
POST   /invoices/:id/void
GET    /invoices/:id/pdf           ← download PDF
```

### Quotes
```
GET    /quotes
POST   /quotes
GET    /quotes/:id
PATCH  /quotes/:id
POST   /quotes/:id/convert         ← convert to invoice
POST   /quotes/:id/send
GET    /quotes/:id/pdf
```

### Expenses
```
GET    /expenses
POST   /expenses
GET    /expenses/:id
PATCH  /expenses/:id
DELETE /expenses/:id
```

### Payments
```
GET    /payments
POST   /payments
GET    /payments/:id
PATCH  /payments/:id
```

### VAT
```
GET    /vat/period?from=&to=       ← VAT summary for a date range
GET    /vat/transactions
```

### Reports
```
GET    /reports/profit-loss?from=&to=
GET    /reports/balance-sheet?date=
GET    /reports/trial-balance?date=
GET    /reports/aged-debtors          ← who owes money and how old the debt is
GET    /reports/aged-creditors        ← who you owe and how old
GET    /reports/cash-flow?from=&to=
```

### Journal
```
GET    /journal
POST   /journal                    ← manual journal entry
GET    /journal/:id
```

---

## 6. FRONTEND PAGES PLAN

| Page                    | Purpose                                          |
|-------------------------|--------------------------------------------------|
| `/login`                | Auth screen                                      |
| `/dashboard`            | Summary: revenue, expenses, outstanding invoices |
| `/clients`              | List all customers                               |
| `/clients/[id]`         | Client profile + invoices + balance              |
| `/invoices`             | All invoices (filter by status: draft/sent/paid) |
| `/invoices/new`         | Create invoice form                              |
| `/invoices/[id]`        | Invoice detail + PDF preview + send button       |
| `/quotes`               | All quotes                                       |
| `/quotes/new`           | Create quote form                                |
| `/quotes/[id]`          | Quote detail + convert to invoice                |
| `/expenses`             | All expenses                                     |
| `/expenses/new`         | Log an expense                                   |
| `/payments`             | All payments received/made                       |
| `/accounts`             | Chart of accounts                                |
| `/journal`              | General ledger / journal entries                 |
| `/vat`                  | VAT report and transactions                      |
| `/reports/profit-loss`  | P&L report with date range picker                |
| `/reports/balance-sheet`| Balance sheet at a point in time                 |
| `/reports/trial-balance`| Trial balance                                    |
| `/reports/aged-debtors` | Outstanding invoices by age                      |
| `/settings`             | Company info, tax number, bank details           |

---

## 7. KEY BUSINESS RULES

1. **Double-entry bookkeeping**: Every transaction creates balanced journal entries (debits = credits). This is non-negotiable for accounting integrity.

2. **Invoice lifecycle**: `DRAFT → SENT → PARTIALLY_PAID → PAID` or `VOID`

3. **Quote lifecycle**: `DRAFT → SENT → ACCEPTED → CONVERTED` or `DECLINED`

4. **Immutable journal entries**: Once posted, journal entries cannot be deleted — only reversed with a counter-entry. This is standard accounting practice.

5. **VAT tracking**: Every invoice and expense that carries VAT gets a `vat_transactions` record for easy tax period reporting.

6. **Period locking**: Once a financial period (month/year) is closed, no entries can be posted to it. Prevents backdating.

7. **Audit trail**: All changes to financial records are timestamped and attributed to a user.

---

## 8. SECURITY CONSIDERATIONS

| Risk                        | Mitigation                                         |
|-----------------------------|---------------------------------------------------|
| Unauthorized access         | JWT auth, role-based guards on all API routes     |
| SQL injection               | Prisma ORM — parameterized queries only           |
| Mass assignment             | DTOs with class-validator whitelist               |
| Sensitive data in logs      | Never log financial figures or PII                |
| CORS                        | Whitelist only the frontend origin                |
| Rate limiting               | NestJS Throttler on all endpoints                 |
| HTTPS                       | Enforced in production via reverse proxy (Nginx)  |

---

## 9. ROLES & PERMISSIONS

| Role            | Access                                                    |
|-----------------|-----------------------------------------------------------|
| `ADMIN`         | Full access — users, settings, all modules                |
| `ACCOUNTANT`    | All financial modules, cannot manage users                |
| `VIEWER`        | Read-only access to reports and invoices                  |

---

## 10. PHASED DELIVERY PLAN

### Phase 1 — Core Foundation (Weeks 1–3)
- [ ] Monorepo setup (Turborepo + NestJS + Next.js + PostgreSQL)
- [ ] Auth module (login, JWT, roles)
- [ ] Client management
- [ ] Supplier management
- [ ] Chart of Accounts setup (pre-seeded defaults)
- [ ] Basic invoice CRUD + PDF export

### Phase 2 — Full Invoicing + Quotes (Weeks 4–5)
- [ ] Invoice lifecycle (send, void, payments)
- [ ] Quotes + convert to invoice
- [ ] Email sending (invoice to client)
- [ ] Expense logging + supplier linking

### Phase 3 — Accounting Engine (Weeks 6–7)
- [ ] Double-entry journal entries (auto-generated from invoices/expenses)
- [ ] Payment reconciliation
- [ ] VAT transaction tracking
- [ ] Manual journal entries

### Phase 4 — Reports + Dashboard (Week 8)
- [ ] Dashboard summary widgets
- [ ] Profit & Loss report
- [ ] Balance Sheet
- [ ] Trial Balance
- [ ] Aged Debtors + Creditors
- [ ] VAT report

### Phase 5 — Polish + Deployment (Week 9)
- [ ] Period locking
- [ ] Audit trail
- [ ] Settings page (company info, logo, tax number)
- [ ] Docker production build
- [ ] Deploy to VPS or cloud

---

## 11. THIRD-PARTY SERVICES NEEDED

| Service             | Use                          | Free Tier? |
|---------------------|------------------------------|------------|
| SMTP (Gmail/SendGrid) | Sending invoices by email  | Yes        |
| Cloudflare          | DNS + HTTPS                  | Yes        |
| VPS (Hetzner/DigitalOcean) | Hosting               | ~$6/mo     |
| Backblaze B2 / S3   | File storage (later)         | Yes        |

---

## 12. STARTING COMMANDS

Once we scaffold the project, these are the main dev commands:

```bash
# Install all dependencies
npm install

# Start everything (API + Web + DB)
docker-compose up -d       # PostgreSQL
npm run dev                # Starts both API and Web via Turborepo

# Database
npx prisma migrate dev     # Run migrations
npx prisma studio          # Visual DB browser

# Build for production
npm run build
```

---

*Blueprint Version 1.0 — Ready for implementation*
