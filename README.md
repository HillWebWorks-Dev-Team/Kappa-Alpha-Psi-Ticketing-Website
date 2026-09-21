# Legendary Entertainment Ticketing

Event ticketing for **Legendary Entertainment** events (currently **Bakk 2 Business**). Database and Stripe can be wired later; this repo supports a **UI preview deploy** on Vercel for stakeholder review.

## Flow

**Event page → Ticket quantity/type → Checkout → Pay → Confirmation → QR ticket → Tickets stored in database**

In UI preview mode, checkout still works end-to-end with temporary in-memory orders (no charges, no durable DB).

## Quick start (local with SQLite)

```bash
npm install
cp .env.example .env
# Set UI_PREVIEW=false (or remove it) for local DB mode
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local UI preview (no DB)

```bash
npm install
cp .env.example .env
# Keep UI_PREVIEW=true
npm run dev
```

### Demo checkout (no Stripe keys)

With placeholder Stripe keys, checkout runs in **demo mode**:
- No card charge
- Order is marked paid immediately
- QR tickets appear on the confirmation page
- Email is skipped unless Resend is configured

Admin password (default): `kappaadmin@2026` → [/admin](http://localhost:3000/admin)

Door check-in (scan QR / enter code): [/admin/check-in](http://localhost:3000/admin/check-in)

## Deploy UI preview on Vercel

1. Push this repo to GitHub (already configured for `HillWebWorks-Dev-Team/Kappa-Alpha-Psi-Ticketing-Website`).
2. In [Vercel](https://vercel.com): **Add New Project** → import that GitHub repo.
3. Framework preset: **Next.js** (auto-detected). Leave build command as `npm run build`.
4. Set these **Environment Variables** (Production + Preview):

| Name | Value |
| --- | --- |
| `UI_PREVIEW` | `true` |
| `DATABASE_URL` | `file:./preview.db` |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR_PROJECT.vercel.app` (update after first deploy) |
| `NEXT_PUBLIC_ORG_NAME` | `Legendary Entertainment Ticketing` |
| `ADMIN_PASSWORD` | a temporary review password |
| `STRIPE_SECRET_KEY` | `sk_test_replace_me` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_replace_me` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_replace_me` |
| `RESEND_API_KEY` | `re_replace_me` (real key for live email) |
| `EMAIL_FROM` | `Legendary Entertainment <tickets@legendaryentertainmentticketing.com>` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `tickets@legendaryentertainmentticketing.com` |

5. Deploy. After the first URL is known, set `NEXT_PUBLIC_APP_URL` to that URL and redeploy.
6. Share the Vercel URL with the boss. They can browse Home, Event Details, Tickets, Checkout (demo), Confirmation, Contact, and Admin.

**Preview caveats:** orders and contact submissions are not durable; serverless instances may reset temporary checkout data after idle time. Ticket types/prices come from `src/lib/demo-data.ts` (keep aligned with `prisma/seed.ts`).

## Production setup (later)

1. Set `UI_PREVIEW=false` (or remove it).
2. Switch Prisma to PostgreSQL and set a real `DATABASE_URL`.
3. Configure Stripe Checkout + webhook `https://YOUR_DOMAIN/api/webhooks/stripe` (`checkout.session.completed`).
4. Configure Resend (`RESEND_API_KEY`, verified `EMAIL_FROM`).
5. Run `npm run db:setup` against the production database.

## Customize the event

- **UI preview:** edit `src/lib/demo-data.ts`
- **Database mode:** edit `prisma/seed.ts`, then `npm run db:setup`

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Prisma + SQLite locally (Postgres for production)
- Stripe Checkout + webhooks (optional until go-live)
- Resend for ticket emails (optional)
- QR codes per ticket (`/ticket/[code]`) + door staff check-in (`/admin/check-in`)

## Client checklist (needed to go live)

- [ ] Final event name, date/time, venue, description
- [ ] Ticket types, prices, capacities (currently: Regular Women $10 / Men $15; Ticket + Adult Capri Sun Women $15 / Men $20)
- [ ] Logo / brand assets
- [ ] Stripe account (live keys)
- [ ] Domain + hosting
- [x] Sending email domain for Resend (`legendaryentertainmentticketing.com` verified)
- [x] Resend API key in Vercel (`RESEND_API_KEY`)
- [ ] Who should receive admin access / password
