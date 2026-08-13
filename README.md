# ALNEEM — E-Commerce Store

A full-stack e-commerce application for ALNEEM (herbal/Ayurvedic skincare), built with:

- **Next.js 14** (App Router) + **Tailwind CSS** — storefront & admin UI
- **Supabase** — Postgres database, Auth, Row Level Security, image storage
- **Resend** — transactional order-notification emails
- **Vercel** — deployment target

It includes a customer storefront (catalog, cart, checkout, accounts) and a
protected admin dashboard (products, coupons, orders, analytics, settings).

---

## 1. Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account
- A free [Resend](https://resend.com) account (for order emails)
- A [Vercel](https://vercel.com) account (for deployment)

---

## 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**. Pick any name/region and a database password (save it somewhere).
2. Once the project is ready, open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**.
   This creates every table, RLS policy, the `product-images` storage bucket, and seeds two sample
   categories plus the Herbal Soothing Cream product from your reference art.
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY` — **keep this secret**, it bypasses all security rules and must never be exposed to the browser or committed to git.

---

## 3. Set up Resend (order emails)

1. Sign up at [resend.com](https://resend.com) → **API Keys → Create API Key**. Copy it into `RESEND_API_KEY`.
2. Under **Domains**, add and verify a domain you own (Resend walks you through the DNS records).
   Once verified, set `EMAIL_FROM` to an address on that domain, e.g. `ALNEEM Store <orders@yourdomain.com>`.
   - Until a domain is verified, Resend only lets you send to your own signup email — fine for testing, not for production.
3. The admin address that actually **receives** order notifications is `alneemcare@gmail.com` by default
   (seeded in `app_settings`), and is editable any time from **Admin → Settings** without a redeploy.

---

## 4. Local development

```bash
npm install
cp .env.example .env.local
# fill in .env.local with the values from steps 2–3
npm run dev
```

Visit `http://localhost:3000`.

---

## 5. Create your admin account

1. On the running site, go to `/signup` and create an account with your own email.
2. Confirm the email (check inbox — Supabase sends this automatically via its built-in auth emails).
3. In Supabase → **SQL Editor**, run:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
4. Go to `/admin/login` and sign in with that same account. You now have full access to the dashboard.

You can promote additional admins the same way at any time.

---

## 6. Adding products

From **Admin → Products → New Product**, fill in title, description, category, price, stock,
optional variants (e.g. `Size` with options `50g, 100g`), and upload one or more photos — they're
stored in the `product-images` Supabase Storage bucket and served over a public CDN URL.
Mark a product **Featured** to have it appear on the homepage.

---

## 7. How checkout + email notifications work

1. Customer fills the checkout form → `POST /api/checkout`.
2. The server **re-prices every item from the database** (never trusts client-sent prices), validates
   any coupon code (expiry, usage limit, minimum order amount), decrements stock, and inserts the order.
3. It then emails:
   - The configured **admin address** — full order + customer + shipping details, order ID and timestamp.
   - The **customer** — a short confirmation.
4. If Resend isn't configured yet (`RESEND_API_KEY` missing), the order still completes — emails are
   just skipped with a console warning, so local development doesn't require Resend to be set up.

---

## 8. Deploying to Vercel

1. Push this project to a GitHub repo.
2. In Vercel: **Add New → Project → Import** your repo.
3. Under **Environment Variables**, add every variable from `.env.example` (with your real values;
   set `NEXT_PUBLIC_SITE_URL` to your production URL).
4. Deploy.
5. **Custom domain:** Vercel → your project → **Settings → Domains → Add**, then point your domain's
   DNS to Vercel as instructed (usually a single `CNAME` or `A` record). SSL is issued automatically.
6. In Supabase → **Authentication → URL Configuration**, add your production URL to
   **Site URL** and **Redirect URLs** so signup/reset emails link back correctly.

---

## 9. Project structure

```
app/
  page.js                    Homepage
  products/                  Catalog + product detail
  categories/[slug]/         Category redirect into filtered catalog
  cart/, checkout/           Cart & checkout flow
  order-confirmation/        Post-purchase screen
  login/, signup/, reset-password/, account/   Customer auth & order history
  admin/                     Protected admin dashboard (see middleware.js)
    products/, coupons/, orders/, settings/
  api/checkout/route.js      Order creation + email trigger (service-role)
components/                  Navbar, Footer, ProductCard, cart/product UI, admin forms
context/                     CartContext (localStorage), AuthContext (Supabase session)
lib/                         Supabase clients (browser/server/admin), email templates, cart storage
supabase/schema.sql          Full DB schema, RLS policies, storage bucket, seed data
middleware.js                Refreshes Supabase session; gates /admin and /account routes
```

---

## 10. Extending payments

The checkout currently supports **Cash on Delivery** end-to-end. An "online payment" option is
present in the UI but disabled — to enable real online payments, integrate Razorpay or Stripe inside
`app/api/checkout/route.js` (create a payment intent/order before writing the DB row, then confirm via
their webhook before marking `payment_status: 'paid'`). Ask if you'd like this wired up next.
