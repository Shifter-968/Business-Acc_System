# Getting Started

This workspace is a logistics accounting platform built for Fannie Logistics.
It is ready to run locally in development, and it includes the backend API, frontend UI, and shared types.

## Prerequisites
- Node.js 20+
- npm 10+
- Docker Desktop with Docker Compose
- PowerShell or a terminal on Windows

---

## Step 1 — Install Dependencies

From the repository root:

```powershell
cd "Pestel_Acc_App"
npm install
```

This installs the entire monorepo, including `apps/api`, `apps/web`, and `packages/shared`.

## Step 2 — Start the Database

```powershell
docker-compose up -d
```

This starts the local database services:
- PostgreSQL at `localhost:5433`
- pgAdmin at `http://localhost:5050`

The database credentials are configured in `docker-compose.yml`.

## Step 3 — Configure Environment Files

Create environment files from the examples:

```powershell
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env
```

Then edit `apps/api/.env` and `apps/web/.env` as needed.

### Required API env values
- `DATABASE_URL` — should match the Docker PostgreSQL connection
- `JWT_ACCESS_SECRET` — strong access token secret
- `JWT_REFRESH_SECRET` — strong refresh token secret
- `PORT=3001`
- `FRONTEND_URL=http://localhost:3000`

### Optional email settings
Configure SMTP only if you want email sending to work:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_NAME`
- `SMTP_FROM_EMAIL`

## Step 4 — Run Database Migrations and Seed Data

From `apps/api`:

```powershell
cd apps\api
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

This will create the database schema and seed a default admin account.

## Step 5 — Start the Platform

From the repository root:

```powershell
npm run dev
```

When the app is running, the URLs are:
- Frontend: `http://localhost:3000`
- API base: `http://localhost:3001/api/v1`
- Swagger docs: `http://localhost:3001/api/docs`

## Default Login

Use the seeded credentials:

- Email: `admin@fannielogistics.co.za`
- Password: `Admin123!`

> Change this immediately after login.

---

## Recommended Test Flow

1. Open `http://localhost:3000` and log in.
2. Verify the API is live at `http://localhost:3001/api/docs`.
3. Create or list clients.
4. Create or view invoices.
5. Create expenses and payments.
6. Browse trucks, trips, payroll, and reports.

---

## Project Structure Summary

```text
apps/api/              ← NestJS backend
apps/web/              ← Next.js frontend
packages/shared/       ← Shared TypeScript types
``` 

## Useful Commands

```powershell
npm install
npm run dev
cd apps/api && npx prisma generate
cd apps/api && npx prisma migrate dev --name init
cd apps/api && npx ts-node prisma/seed.ts
```

## Notes

- `npm run dev` from the root uses Turborepo and starts both frontend and backend development servers.
- If you need to push to GitHub from this copy, initialize git and add the remote repo before pushing.
- The API docs at `http://localhost:3001/api/docs` are the best way to verify backend endpoints.
