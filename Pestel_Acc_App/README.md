# Fannie Logistics Accounting Platform

This repository contains a logistics-focused accounting platform built as a Turborepo monorepo.
It includes a NestJS backend API, a Next.js frontend, and shared TypeScript types.

## Purpose

This is a startup-ready application for testing logistics accounting workflows. It is designed for:
- invoicing and quotes
- supplier expenses and payments
- payroll and employee management
- truck and trip tracking
- VAT reporting and basic financial reports

## Quick Start for Testers

### Prerequisites
- Node.js 20+
- npm 10+
- Docker Desktop with Docker Compose
- A terminal on Windows (PowerShell is shown below)

### Repository Setup

From the repository root:

```powershell
cd "Pestel_Acc_App"
npm install
```

> This runs install for the entire monorepo and prepares both `apps/api` and `apps/web`.

### Start Database Services

```powershell
docker-compose up -d
```

This starts:
- PostgreSQL at `localhost:5433`
- pgAdmin at `http://localhost:5050`

### Configure Environment Files

Copy the example environment files and fill any secrets:

```powershell
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env
```

Then open and verify:
- `apps/api/.env`
- `apps/web/.env`

The web app uses `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`.
The API expects `DATABASE_URL`, JWT secrets, and optional SMTP config for email.

### Run Database Migrations and Seed Data

From `apps/api`:

```powershell
cd apps\api
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

This creates the schema and seeds the default admin user.

### Start the Application

From the repository root:

```powershell
npm run dev
```

After startup, the expected URLs are:
- Frontend: `http://localhost:3000`
- API base: `http://localhost:3001/api/v1`
- Swagger API docs: `http://localhost:3001/api/docs`

## Default Login

Use the seeded admin account:

- Email: `admin@fannielogistics.co.za`
- Password: `Admin123!`

> Change this immediately after first login.

## What to Test First

1. Log in at the frontend.
2. Open the API docs at `/api/docs` to verify the backend is running.
3. Test client creation and client list retrieval.
4. Test invoice creation and invoice listing.
5. Test expense creation and payment records.
6. Browse trucks, trips, payroll, and reports pages.

## Project Structure

```text
apps/api/      ← NestJS backend API
apps/web/      ← Next.js frontend
packages/shared/ ← shared TypeScript types
``` 

## Notes for a Hiring Manager or Tester

- The project is built as a monorepo using Turborepo.
- The backend uses Prisma and PostgreSQL.
- The frontend is a Next.js app with a client-side API wrapper.
- Swagger is enabled for API exploration.
- Full end-to-end runtime depends on Docker PostgreSQL and local `.env` values.

## If You Want to Push to GitHub

This local copy does not currently include a Git repository metadata folder (`.git`).
If you need to push this project to GitHub, run:

```powershell
git init

git add .
git commit -m "Initial Fannie Logistics accounting platform"
git branch -M main
git remote add origin https://github.com/Shifter-968/Business-Acc_System.git
git push -u origin main
```

If you already have an existing remote repository, use that remote URL instead.

## Additional Documentation

- `GETTING_STARTED.md` — Detailed setup steps for running the app
- `BLUEPRINT.md` — Architecture and implementation overview
- `FANNIE_LOGISTICS_BLUEPRINT.md` — Logistics operating blueprint and product vision
