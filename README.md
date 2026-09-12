# Lulu Bakery

Website for a small cake bakery in Chino Hills. Customers can browse cakes and sweets, filter by category, and place a custom order with a PayPal deposit. Orders are emailed to the bakery. There’s also a simple `/admin` page for uploading new products.

Built with Next.js, Supabase (product data + image storage), Nodemailer, and PayPal.

Live site: set `NEXT_PUBLIC_SITE_URL` in your env (see below).

## Setup

You need Node.js 20+.

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | What it’s for |
|---|---|
| `SMTP_*` / `ORDER_NOTIFICATION_EMAIL` | Email when someone submits an order |
| `ADMIN_PAGE_PASSWORD` | Login for `/admin` |
| `NEXT_PUBLIC_SUPABASE_URL` / keys / `SUPABASE_STORAGE_BUCKET` | Products + uploaded images |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Deposit checkout on the order page |
| `PAYPAL_MODE` | `sandbox` for testing, `live` for production |
| `NEXT_PUBLIC_ORDER_DEPOSIT_USD` | Deposit amount (e.g. `50.00`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for sitemap / SEO |

PayPal credentials come from the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications). For Gmail/QQ/etc. SMTP, use an app password, not your normal login.

Then create the products table and a public storage bucket in the Supabase SQL editor:

```sql
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('men', 'women', 'kids')),
  image_url text,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.products disable row level security;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
```

(Extra migrations for sort order live under `supabase/migrations/`.)

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin is at `/admin`.

```bash
npm test          # unit + a11y smoke tests
npm run build     # production build
npm start         # serve the build
```

## Project layout

- `src/app/` — pages and API routes (order, products, PayPal, admin)
- `src/components/` — header, footer, gallery/order UI, PayPal button
- `src/lib/` — validation, email, Supabase helpers, search
- `public/` — static images
- `docs/` — design notes, accessibility report, presentation materials

## Deploy

Push to GitHub and connect the repo in Vercel. Copy the same env vars into the Vercel project. After changing any `NEXT_PUBLIC_*` value, redeploy.
