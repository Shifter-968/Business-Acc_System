# Fannie Logistics Operating Blueprint

## 1. What This System Should Manage

Core business flows for a trucking company:
- Job quote -> trip order -> trip execution -> invoice -> payment receipt
- Fuel and toll advances -> driver reconciliation -> final expense posting
- Preventive maintenance -> workshop jobs -> spare parts costs
- Payroll for employees (drivers, guards, mechanics, office)
- Shareholder distributions from profit (not payroll)

## 2. Payroll vs Shareholder Payouts

Payroll includes:
- Drivers
- Security guards
- Mechanics
- Admin/operations staff

Payroll components:
- Basic salary or wages
- Trip allowance/per diem
- Overtime
- Night-out allowance
- Deductions (tax, pension, loans, advances)

Shareholders (70% and 30%) should NOT be in payroll by default.
- Treat these as equity owners
- Pay them through dividend/profit distribution records
- Keep separate from salaries for tax and reporting clarity

## 3. Trucking-Specific Modules Needed

Keep and prioritize:
- Trucks: registration, capacity, status, insurance, license expiry
- Trips: origin, destination, cargo type, assigned truck/driver, status
- Fuel: fuel issue logs, liters, amount, route usage
- Maintenance: planned service, breakdown incidents, workshop jobs
- Route costing: expected vs actual trip margin
- Payroll: employee runs and shareholder distribution schedule

Optional but valuable:
- Tyre management and retread cycles
- Driver scorecard (fuel efficiency, incident count, on-time delivery)
- Integration endpoint for existing truck tracking telemetry

## 4. What To Remove or De-prioritize

From the original ad-agency orientation:
- Ad campaign language and assumptions
- Advertiser-specific terms in UI labels and reports

Keep reusable accounting capabilities:
- Invoices, expenses, payments, journal, VAT, reports

## 5. Accounting Flow Mapping (Logistics)

Typical postings:
- Trip invoice issued: Debit Accounts Receivable, Credit Transport Revenue
- Fuel purchase (cash): Debit Fuel Expense, Credit Cash/Bank
- Maintenance supplier bill: Debit Maintenance Expense, Credit Accounts Payable/Cash
- Payroll run: Debit Salaries Expense, Credit Payroll Payable/Bank
- Shareholder payout: Debit Retained Earnings, Credit Bank

## 6. Implementation Roadmap

Phase 1 (done/foundation):
- Rebrand to Fannie Logistics
- Add basic Trucks, Trips, and Payroll API modules
- Enable trucking expense and trip-invoice helper methods

Phase 2 (next):
- Add Prisma entities: Truck, Trip, DriverProfile, MaintenanceJob, PayrollRun, DividendRun
- Link expenses and invoices directly to trip/truck records
- Build trip profitability report

Phase 3:
- Integrate GPS/telematics feed from existing tracking system
- Add dispatch board, maintenance reminders, and payroll approvals

## 7. Compliance and Control Notes

- Lock closed accounting periods
- Require approval for manual journals and payroll finalization
- Keep immutable audit trails for payroll and shareholder distributions
- Separate user permissions: finance vs operations vs admin
