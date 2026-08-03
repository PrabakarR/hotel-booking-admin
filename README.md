# Cedar Ridge Lodge — Hotel Booking Admin (MVP)

Internal staff dashboard for room booking management. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Zustand, and Framer Motion.

The UI talks to a **service → repository** layer backed by realistic mock JSON today. Swap repositories to NestJS later without rewriting pages.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo login

- Email: `admin@hotel.com`
- Password: `password123`

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint

## Architecture

```
UI pages / forms
  → TanStack Query hooks
    → services/          (use-case API)
      → repositories/    (data access)
        → mock store     (today)
        → NestJS HTTP    (later via lib/api-client.ts)
```

### NestJS swap path

1. Set `NEXT_PUBLIC_API_URL` (see `.env.example`).
2. Implement HTTP repositories that call NestJS using `apiClient` in `src/lib/api-client.ts`.
3. Keep service method signatures the same so hooks and pages stay unchanged.

## Features

- Login (mock auth + Remember Me)
- Dashboard stats, charts, recent bookings, quick actions
- Rooms CRUD with status badges, search, pagination
- Customers list/detail/edit
- Bookings create/edit/cancel/checkout with filters
- Reports with Excel + PDF export
- Settings (hotel profile, logo preview, dark mode)

## Mock data

- 20 rooms
- 50 customers
- 100 bookings

Seed files live in `src/mock/data/`.
