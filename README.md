# Restaurant Reservation Management System

A full-stack table reservation system built for the assignment. Customers can search for and reserve tables in
real time; admins can view, edit, and cancel any reservation from a live
dashboard. Includes two bonus features: Razorpay deposit payments and
Socket.io real-time updates.

## Live Deployment

- **Frontend (Vercel):** https://restaurant-reservation-system-seven-zeta.vercel.app
- **Backend (Render):** https://restaurant-reservation-system-z0xy.onrender.com

> Note: period of inactivity can take 30–60 seconds to wake up (cold start).

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@restaurant.com` | `Admin@12345` |
| Customer | Register a new account from the app — public sign-up always creates a customer. |

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcryptjs,
Socket.io, Razorpay.

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router,
Axios, Socket.io-client, lucide-react.

## Repository Structure
 
```
restaurant-reservation-system/
├── README.md                        ← this file
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── server.js                    Entry point - HTTP server + Socket.io + DB connect
│   └── src/
│       ├── app.js                   Express app, middleware, route mounting
│       ├── seed.js                  Creates the admin user + sample tables
│       ├── config/
│       │   └── db.js                MongoDB connection
│       ├── models/
│       │   ├── User.js              name, email, password (hashed), role
│       │   ├── Table.js             tableNumber, capacity, isActive
│       │   └── Reservation.js       user, table, date, startTime, endTime, guests, status, payment
│       ├── middleware/
│       │   └── auth.js              protect (JWT verify) + authorize (role check)
│       ├── controllers/
│       │   ├── authController.js         register, login, getMe
│       │   ├── tableController.js        list/create/update/deactivate tables
│       │   ├── reservationController.js  create/list/cancel + availability check (core overlap logic)
│       │   ├── adminController.js        list all, update, cancel any reservation; create admin
│       │   └── paymentController.js      Razorpay order creation + signature verification
│       ├── routes/
│       │   ├── authRoutes.js         /api/auth/*
│       │   ├── tableRoutes.js        /api/tables/*
│       │   ├── reservationRoutes.js  /api/reservations/*
│       │   ├── adminRoutes.js        /api/admin/*
│       │   └── paymentRoutes.js      /api/payments/*
│       └── utils/
│           ├── generateToken.js      JWT signing
│           └── socket.js             Socket.io init + room-based notify helpers
│
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.ts                Vite + Tailwind v4 plugin
    ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
    └── src/
        ├── main.tsx                  App entry - Router + ToastProvider + AuthProvider
        ├── App.tsx                   Route definitions + role-based redirects
        ├── index.css                 Tailwind v4 import + @theme design tokens (palette, fonts)
        ├── types/
        │   └── index.ts              Shared TS types matching backend shapes, fixed time slots
        ├── utils/
        │   └── format.ts             Date/time/currency formatting helpers
        ├── lib/
        │   ├── api.ts                Axios instance with JWT interceptor
        │   ├── socket.ts             Socket.io-client connection lifecycle
        │   └── razorpay.ts           Razorpay Checkout script loader
        ├── context/
        │   ├── AuthContext.tsx       Login/register/logout, session persistence, socket connect
        │   └── ToastContext.tsx      Toast notifications (react-hot-toast wrapper)
        ├── components/
        │   ├── Layout.tsx            Navbar + page outlet shell
        │   ├── Navbar.tsx            Role-aware nav links, responsive mobile menu
        │   ├── ProtectedRoute.tsx    Auth + role route guard
        │   ├── Button.tsx / Field.tsx   Shared form primitives
        │   ├── EmptyState.tsx        Empty-list placeholder
        │   ├── StatusBadge.tsx       Reservation/payment status pills
        │   ├── ReservationCard.tsx   Signature "ticket stub" reservation card
        │   ├── TableOptionCard.tsx   Table availability result (customer booking)
        │   └── AdminEditForm.tsx     Inline reschedule form (admin dashboard)
        └── pages/
            ├── LoginPage.tsx
            ├── RegisterPage.tsx
            ├── NotFoundPage.tsx
            ├── customer/
            │   ├── BookTablePage.tsx        Search availability, reserve, optional deposit
            │   └── MyReservationsPage.tsx   View/cancel own reservations, pay pending deposit
            └── admin/
                ├── AdminDashboardPage.tsx   All reservations, filter, edit/cancel, live updates
                └── ManageTablesPage.tsx     Add/deactivate tables
```
 

---

## Setup Instructions

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```dotenv
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb_connection_string

# Auth
JWT_SECRET=a_long_random_string
JWT_EXPIRES_IN=7d

# Razorpay (bonus - payments)
RAZORPAY_KEY_ID=razorpay_test_key_id
RAZORPAY_KEY_SECRET=razorpay_test_key_secret

# Seed admin (used only by npm run seed)
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@restaurant.com
ADMIN_PASSWORD=Admin@12345
```

Then seed an admin account and a starting set of tables, and start the server:

```bash
npm run seed   # creates the admin above + 6 sample tables (skips if they already exist)
npm run dev    # http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Fill in `.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_test_key_id
```

```bash
npm run dev    # http://localhost:5173
```

`VITE_RAZORPAY_KEY_ID` must match `RAZORPAY_KEY_ID` on the backend — the
frontend uses it to open Razorpay Checkout, and the backend uses the paired
secret to verify the payment signature server-side.

---

## Assumptions Made

- Single restaurant, a fixed set of tables. Tables are seeded via
  `npm run seed` and can otherwise be added/deactivated by an admin from
  the "Manage tables" screen — no multi-restaurant support.
- `date` is stored as `YYYY-MM-DD` and `startTime`/`endTime` as `HH:MM`
  (24-hour), rather than a single `Date` object with a duration. This keeps
  the overlap comparison a simple string comparison and avoids timezone
  ambiguity, since the restaurant operates in one local timezone.
- The frontend offers four fixed dining slots (12:00–1:30, 1:30–3:00,
  7:00–8:30, 8:30–10:00) rather than a free-form time picker, for a
  simpler booking UX — the backend itself accepts any valid start/end pair.
- Public registration (`POST /api/auth/register`) always creates a
  **customer** account. Admin accounts only come from the seed script or
  from an existing admin creating another one — this prevents anyone from
  self-granting admin access.
- The Razorpay deposit is optional and fixed at ₹200. It's a hold on the
  table, not full payment for the meal — declining it still leaves the
  reservation confirmed.

## Reservation & Availability Logic

A table is considered available for a new booking only if no other
**confirmed** reservation on that table, on the same date, has an
overlapping time range. Because both `startTime` and `endTime` are stored
as zero-padded `HH:MM` strings, a plain string comparison is chronologically
correct — no date-parsing needed:

```
existingReservation.startTime < newReservation.endTime
  AND
newReservation.startTime < existingReservation.endTime
```

Cancelled reservations are excluded from this check entirely, so cancelling
a booking immediately frees that slot for someone else. Table capacity
(`guests <= table.capacity`) is validated *before* the overlap check, so an
oversized party gets a specific "table only seats N" message rather than a
generic conflict error.

The frontend calls `GET /api/reservations/availability` for every table
before displaying it as bookable, so a customer never sees a table offered
that the backend would then reject — the same overlap logic runs on both
the availability check and the final booking, so there's no gap between
what's shown and what's enforced.

## Role-Based Access (Customer vs Admin)

Every JWT carries `{ id, role }`. Two layers enforce access:

1. **Middleware** — `protect` verifies the token and loads the user;
   `authorize('admin')` / `authorize('customer')` gate entire route groups
   (`/api/admin/*` is admin-only, `/api/reservations/*` is customer-only).
2. **Ownership checks inside controllers** — role alone isn't enough for a
   customer's own routes. `cancelMyReservation`, for example, also checks
   `reservation.user.toString() === req.user._id.toString()`, so one
   customer can never see or cancel another customer's booking, even
   though both are hitting the same endpoint pattern.

On the frontend, `ProtectedRoute` reads the role out of the stored session
and redirects: an unauthenticated visitor is sent to `/login`; a logged-in
customer who tries to open `/admin` is redirected back to `/book`, and vice
versa. The Navbar only ever renders links for the current user's role.

**Customer can:** create a reservation, view only their own reservations,
cancel only their own reservations, optionally pay a deposit on their own
reservation.

**Admin can:** view every reservation (filterable by date/status), edit or
cancel any reservation, manage tables (add/deactivate), create additional
admin accounts.

## Bonus Features

### Real-time updates (Socket.io)
The same JWT used for REST calls authenticates the Socket.io handshake.
Customers join a private `user_<id>` room; admins join a shared `admins`
room. The backend emits `reservation:created`, `reservation:updated`,
`reservation:cancelled`, and `reservation:paid` on the relevant actions, so
the admin dashboard and a customer's own reservation list update live
without polling.

### Payments (Razorpay)
`POST /api/payments/create-order` creates a Razorpay order for the deposit;
the frontend opens Razorpay's hosted checkout. On success,
`POST /api/payments/verify` recomputes the HMAC-SHA256 signature
server-side and only marks the payment `paid` if it matches — the payment
status is never trusted from the client directly.

## Known Limitations

- No email/SMS notifications — real-time updates are in-app (Socket.io)
  only, not out-of-band.
- No pagination on the admin reservations list; fine at the current scale,
  would need it for a high-volume restaurant.
- No automated test suite.
- JWTs are long-lived (7 days) with no refresh-token flow or revocation list.
- The Render free-tier backend cold-starts after inactivity, so the first
  request after a while can be slow.
- Deposit amount is a fixed constant, not configurable per reservation size.

## Areas for Improvement With Additional Time

- Add Jest/Supertest integration tests, especially around the
  overlap-checking logic, since that's the core correctness requirement.
- Add pagination and date-range queries for the admin reservation list.
- Add a `waitlist` status for fully booked slots instead of a flat rejection.
- Move to refresh tokens with rotation for better session security.
- Add a real floor-plan visualization for table selection instead of a list.
- Rate-limit the auth endpoints against brute-force attempts.