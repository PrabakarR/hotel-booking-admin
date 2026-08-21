# Cedar Ridge Lodge — Hotel Booking Admin

Internal staff dashboard for room booking management.

Frontend: Next.js 16 (App Router) + TypeScript + Tailwind + TanStack Query  
Backend: NestJS + Prisma + JWT  
Database: Supabase PostgreSQL

The frontend never talks to the database. All business logic lives in NestJS.

## Local development

### 1. Database (Supabase PostgreSQL)

Create a Supabase project and copy the connection strings:

- **DATABASE_URL** — pooled URI (port `6543`, add `?pgbouncer=true`)
- **DIRECT_URL** — direct URI (port `5432`) for Prisma migrations

### 2. Backend

```bash
cd backend
cp .env.example .env
# fill DATABASE_URL, DIRECT_URL, JWT_SECRET, SEED_ADMIN_PASSWORD

npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

API: http://localhost:3001/api  
Swagger: http://localhost:3001/api/docs

### 3. Frontend

From the project root:

```bash
cp .env.example .env.local
npm install
npm run dev
```

UI: http://localhost:3000

### Convenience scripts (from repo root)

```bash
npm run dev:frontend
npm run dev:backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run test:backend
```

## Test credentials

Seeded from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults below):

| Email | Password | Role |
| --- | --- | --- |
| admin@hotel.com | password123 | ADMIN |
| admin@example.com | password123 | ADMIN |

Never use these passwords in production. Set `SEED_ADMIN_PASSWORD` in `backend/.env`.

## Date handling (Asia/Kolkata)

Hotel calendar dates are **date-only**, not timestamps.

- Stored in PostgreSQL as `DATE`
- Sent over the API as `YYYY-MM-DD`
- Interpreted as Asia/Kolkata hotel days
- Overlap rule is half-open: `[checkIn, checkOut)` so a 21–23 stay does not block a 23–24 stay

## Booking rules

- Double-booking the same room for overlapping active dates returns **409 Conflict**
- Create / check-in / checkout / cancel / payment use Prisma transactions
- Check-in → booking `CHECKED_IN`, room `OCCUPIED`
- Checkout → booking `CHECKED_OUT`, remaining balance settled, room `CLEANING`
- Cancel is a soft status change; history is kept
- Booking numbers look like `BK-20260821-0001`

## API overview

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` |
| Rooms | `GET/POST /api/rooms`, `GET /api/rooms/available`, `GET /api/rooms/all`, `PATCH/DELETE /api/rooms/:id` |
| Customers | `GET/POST /api/customers`, `GET /api/customers/all`, `GET /api/customers/:id/bookings` |
| Bookings | `GET/POST /api/bookings`, `POST /api/bookings/:id/check-in\|check-out\|cancel` |
| Payments | `GET/POST /api/bookings/:id/payments` |
| Dashboard | `GET /api/dashboard/summary`, `recent-bookings`, `upcoming-checkouts` |
| Reports | `GET /api/reports`, `/revenue`, `/daily`, `/monthly`, `/occupancy` |
| Settings | `GET/PATCH /api/settings` |

Private routes require `Authorization: Bearer <token>`.

## Docker (API only)

The production database is Supabase, so Compose does **not** start local Postgres.

```bash
docker compose up --build
```

## Tests

```bash
cd backend
npm test
```

Covered: login, create room, create customer, create booking, overlapping dates, check-in, checkout, cancel, add payment, dashboard summary.
