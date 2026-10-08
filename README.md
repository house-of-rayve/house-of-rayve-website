# RAYVE — E-commerce store

Premium eyewear storefront with a customer dashboard and a real-time admin panel.
Built with Next.js 16 (App Router, JavaScript, `src/` directory, React Compiler), Tailwind CSS v4, Prisma and Supabase (Postgres + Storage).

## Quick start

```bash
npm install          # also generates the Prisma client
cp .env.example .env # fill in the Supabase values + AUTH_SECRET (openssl rand -hex 32)
npm run setup        # creates the tables in Supabase and loads demo data
npm run dev
```

### Connecting Supabase

1. Create a project at supabase.com (region: Mumbai / closest to your users). Use a database password
   with only letters and numbers — symbols like `@ # / ?` break the connection string.
2. Click **Connect** in the Supabase dashboard:
   - *Transaction pooler* (port 6543) → `DATABASE_URL`, and append `?pgbouncer=true&connection_limit=5&pool_timeout=20`
   - *Session pooler* (port 5432) → `DIRECT_URL`
   - Replace `[YOUR-PASSWORD]` in both with the database password.
3. Optional — **Project Settings → API**: Project URL → `SUPABASE_URL`, `service_role` key →
   `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose it). Product image uploads then go to Supabase
   Storage; the `product-images` bucket is created automatically.
4. Run `npm run setup`, then restart `npm run dev`. Tables appear under **Table Editor** in Supabase.

### Google sign-in

1. In Google Cloud Console (project **House of rayve**) open **Google Auth Platform**:
   - **Branding**: app name `RAYVE`, support email, and add `vercel.app` (or your domain) under authorised domains.
   - **Audience**: User type *External*. While in *Testing*, only listed test users can sign in — click
     **Publish app** to open it to everyone.
   - **Data access**: scopes `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
2. **Clients → Create client → Web application**:
   - Authorised JavaScript origins: `http://localhost:3000`, `http://localhost:3001`, `https://house-of-rayve-website.vercel.app`
   - Authorised redirect URIs: the same origins + `/api/auth/google/callback`
3. Copy the Client ID / Client secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (in `.env` and in Vercel),
   then restart / redeploy. The "Continue with Google" button appears automatically once both are set.

Open http://localhost:3000.

### Demo accounts (created by the seed)

| Role     | Email               | Password         |
| -------- | ------------------- | ---------------- |
| Admin    | admin@rayve.in      | Rayve@Admin123   |
| Customer | aarav@example.com   | Customer@123     |

All 10 seeded customers use the same password. Override the admin login with `ADMIN_EMAIL` / `ADMIN_PASSWORD` when running `npm run db:seed`. **Change these before going live.**

`npm run db:seed` wipes the database and reloads the demo catalogue, customers and orders.

## What's included

**Storefront** — home, shop with category/shape/sort/search filters, product pages with gallery,
slide-out bag (saved in the browser), cart, checkout (cash on delivery or demo online payment), brand page.

**Customer dashboard (`/account`)** — overview, order history, order detail with status timeline and
cancellation, profile and password editing, address book (add / edit / delete / set default).

**Admin panel (`/admin`)** — admin role only.
- Live dashboard: revenue, orders, customers, average order value, 14-day revenue chart, order status
  breakdown, recent orders, best sellers, low-stock alerts and an activity feed. Updates instantly over
  Server-Sent Events when orders are placed or changed, customers sign up, or products change.
- Products: list, search, add, edit, delete, show/hide, feature, image upload.
- Orders: filter by status, search, update order and payment status (cancelling restocks inventory).
- Customers: list with phone, address, order count and spend; edit name, email, phone and address.

## Project structure

```
prisma/schema.prisma      data model (User, Address, Product, Order, OrderItem)
prisma/seed.mjs           demo data
src/proxy.js              route protection for /account, /checkout, /admin
src/lib/                  auth (JWT cookie), prisma client, orders, stats, event bus
src/app/(store)/          storefront + customer dashboard
src/app/(auth)/           login / register
src/app/admin/            admin panel
src/app/api/              REST API (auth, products, orders, account, admin, uploads)
src/components/           UI components
public/images, public/brand   photography and logo from the brand kit
```

## Going to production

- Add the same environment variables in your hosting provider (e.g. Vercel → Settings → Environment Variables).
- Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` before hosting: without them, admin uploads go to the
  local `/uploads` folder, which does not persist on serverless hosting.
- The live dashboard uses an in-process event bus plus a 15-second refresh; with several server
  instances, swap `src/lib/events.js` for Redis pub/sub or similar.
- "Pay online" is a demo that marks orders paid — connect Razorpay/Stripe before taking real payments.
- Fonts: Michroma and Inter (Google Fonts) stand in for the brand's Eurostile Extended and Suisse Intl,
  which are licensed fonts — add the licensed files via `next/font/local` when available.
