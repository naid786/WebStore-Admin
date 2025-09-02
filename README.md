# WebStore Admin

Full‑stack e‑commerce admin dashboard built with Next.js 15 (App Router), TypeScript, Prisma (MySQL), Clerk authentication, Stripe checkout & webhooks, AWS S3 compatible object storage (t3.storage.dev), TailwindCSS 4, Radix UI primitives, Zustand, React Hook Form + Zod, and Recharts.

## Key Features

* Multi‑store management (route segment `[storeId]`)
* Catalogue & Category management (featured / archived flags)
* Product CRUD with image upload (presigned S3 URLs) & inventory quantity
* Orders & paid status auto‑update via Stripe webhook
* Store settings & switcher
* Light/Dark theme (next-themes)
* Dashboard analytics: revenue, sales count, stock count, graph revenue
* Secure auth (Clerk) & server actions / API routes separation

## Tech Stack

* Framework: Next.js 15 (App Router, Server Components, Route Handlers)
* Language: TypeScript
* UI: TailwindCSS 4, Radix UI, shadcn-inspired components
* State: React / Server Components + Zustand (modals) + React Hook Form
* Validation: Zod
* Database: MySQL via Prisma
* Payments: Stripe Checkout Session + Webhook
* Storage: S3 compatible endpoint (t3.storage.dev)
* Auth: Clerk
* Charts: Recharts

## Project Structure (abridged)

```text
app/
	(auth)/...(Clerk sign-in/up)
	(dashboard)/[storeId]/(routes)/... feature pages
	api/... route handlers (REST-ish JSON)
actions/    (server actions for analytics)
components/ (re-usable UI + modals + tables)
hooks/      (Zustand store + origin util)
lib/        (prisma, stripe, s3 client, utils)
prisma/     (schema.prisma)
```

## Environment Variables

Create a `.env` file (never commit) with:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DB?sslaccept=strict"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."   # if using Clerk webhooks (optional)

# Stripe
STRIPE_API_KEY="sk_live_or_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."   # from Stripe CLI / Dashboard
FRONTEND_STORE_URL="https://your-store-frontend.example" # public storefront URL used for success/cancel

# S3 Compatible Storage
S3_BUCKET_NAME="your-bucket-name"
S3_ACCESS_KEY_ID="..."           # if required by provider
S3_SECRET_ACCESS_KEY="..."       # if required by provider

# (Optional) Node env
NODE_ENV=development
```

## Installing & Running

```bash
pnpm install            # or npm install / yarn
pnpm prisma migrate dev --name init  # first time
pnpm dev
```

Visit: <http://localhost:3000>

Stripe webhook (dev) example (Stripe CLI installed):

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

## Database & Prisma

* Schema in `prisma/schema.prisma`
* Run migrations: `pnpm prisma migrate dev`
* Generate client: `pnpm prisma generate` (auto with migrate)
* Inspect DB: `pnpm prisma studio`

## Core Domain Models (simplified)

* Store → has many Catalogue, Category, Product, Order
* Product ↔ Category (many-to-many)
* Product ↔ Catalogue (many-to-many)
* Order → OrderItems (each links to Product). On payment success products are archived
* Images (Product, Catalogue images) stored via S3 object keys

## Image Upload Flow

1. Client requests POST `/api/s3/upload` with filename, contentType, size
2. Server validates (Zod), generates UUID key, returns presigned PUT URL & public retrieval URL
3. Client PUTs file to presigned URL
4. Key & URL stored with product / catalogue entry

## Checkout & Orders

1. Client posts productIds to `/api/[storeId]/checkout`
2. Server creates draft Order + Stripe Checkout session (ZAR currency)
3. Redirect user to `session.url`
4. Stripe sends webhook `checkout.session.completed` → `/api/webhook`
5. Server marks Order `isPaid=true`, stores address/phone, archives products

## API Route Highlights

`/api/stores` (POST create store)  
`/api/[storeId]/products` CRUD products  
`/api/[storeId]/categories` CRUD categories  
`/api/[storeId]/catalogues` CRUD catalogues  
`/api/[storeId]/orders` list orders (paid status)  
`/api/[storeId]/checkout` create Stripe checkout session  
`/api/webhook` Stripe webhook handler  
`/api/s3/upload` & `/api/s3/delete` presigned operations

Most routes enforce Clerk auth (server side) and store ownership; responses are JSON.

## Analytics (Server Actions in `actions/`)

* `get-total-revenue`
* `get-sales-count`
* `get-stock-count`
* `get-graph-revenue` (time series for chart)

## UI Components

Custom components mirror shadcn patterns (Button, Card, Dialog, Dropdown, Table, Form wrappers, etc.) plus domain-specific tables (DataTable with TanStack React Table) and modals (Store modal, Upload modal, Alert modal).

## State & Modals

Minimal client state. Modals via Zustand store in `hooks/use-store-modal.tsx`.

## Theming

`next-themes` with `ThemeProvider` and Tailwind CSS class strategy.

## Formatting & Linting

`pnpm lint` runs ESLint (Next.js config). Tailwind class merging via `tailwind-merge` and helper `cn()`.

## Deployment Notes

* Ensure all env vars set in hosting provider (Vercel etc.)
* Add Stripe webhook endpoint in Stripe Dashboard (live secret) after deploy
* Run `prisma migrate deploy` in production build pipeline
* Configure S3 bucket CORS to allow PUT from your domain if required

## Security Considerations

* Server validates ownership using Clerk `userId`
* Never trust client for price; price pulled from DB before Stripe session creation
* Webhook signature verified using `STRIPE_WEBHOOK_SECRET`
* Presigned URLs expire quickly (360s)

## Troubleshooting

| Issue | Possible Cause | Fix |
|-------|----------------|-----|
| 500 on image upload | Missing S3 env vars | Confirm bucket & credentials |
| 400 Webhook Error | Wrong webhook secret | Update `STRIPE_WEBHOOK_SECRET` |
| Prices off by 100x | Forgot *100 conversion | Ensure price stored as Decimal; unit_amount = price*100 |
| Auth redirect loop | Misconfigured Clerk keys | Check publishable & secret key pairing |

## Future Enhancements (Ideas)

* Inventory reservation & decrement instead of archive on purchase
* Discount codes / coupons
* Pagination & filtering for products/orders
* Role-based access per store
* Metrics caching layer (Redis) for analytics

## License

Proprietary – adjust this section if you intend to open source.

---

Generated README – customize further for branding or contribution guidelines.

