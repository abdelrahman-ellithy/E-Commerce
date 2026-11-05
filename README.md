# LUMA — MERN E-Commerce

LUMA is a complete, production-minded e-commerce application built with the MERN stack. It pairs a polished, responsive storefront with a full admin studio for managing products, orders, and inventory.

The repository is an npm workspaces monorepo: a modular Express/Mongoose API in `backend/` and a Vite + React + Tailwind storefront in `frontend/`, started together with a single command.

---

## Table of contents

- [Highlights](#highlights)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Demo accounts](#demo-accounts)
- [Available scripts](#available-scripts)
- [How it works](#how-it-works)
- [API reference](#api-reference)
- [Testing from the terminal](#testing-from-the-terminal)
- [Automated tests](#automated-tests)
- [Production deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Highlights

**Storefront**

- Editorial homepage with featured collections, categories, and promotions.
- Shop with keyword search, category, price, rating, and in-stock filters plus sorting and pagination.
- Product pages with gallery, stock state, discount pricing, reviews, and related products.
- Persistent cart stored in `localStorage` with stock-aware quantity controls.
- Account registration, sign-in, profile editing, and password changes.
- Checkout with validated shipping address and cash-on-delivery payment.
- Customer order history, live status timeline, order detail, and cancellation before dispatch.
- Responsive layouts, accessible controls, image fallbacks, toast feedback, skeleton loaders, and 404 page.

**Admin studio**

- Dashboard with revenue, order, product, and customer KPIs.
- Six-month revenue chart and order-status breakdown rendered without a chart dependency.
- Low-stock alerts and recent orders with direct links.
- Product table with search, status/category filters, sorting, and pagination.
- Create/edit forms with client and server validation, image previews, featured/active toggles.
- Order queue with status filters and order-number search.
- Order detail with fulfilment progression, internal notes, payment recording, cancellation, and full activity history.

**Backend**

- MVC structure with routes, controllers, models, validators, and middleware.
- JWT authentication with bcrypt password hashing.
- Role-based authorization (`user` / `admin`).
- `express-validator` request validation and a centralized error handler.
- Helmet, CORS allow-list, compression, Morgan logging, and rate limiting.
- Server-side price calculation; client totals are never trusted.
- Atomic stock reservation with rollback if order creation fails.
- Database indexes, pagination helpers, and consistent JSON envelopes.
- Seed script with demo accounts, 16 products, reviews, and sample orders.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 6, Tailwind CSS 3 |
| State | Context API (`AuthContext`, `CartContext`, `ToastContext`) |
| HTTP client | Axios with JWT request interceptor and 401 handling |
| Icons | lucide-react |
| Backend | Node.js, Express 4, Mongoose 8 |
| Auth | JSON Web Tokens + bcryptjs |
| Validation | express-validator |
| Security | Helmet, CORS, rate limiting, input validation |
| Database | MongoDB (local, Docker, or Atlas) |
| Tests | Node test runner, Supertest, mongodb-memory-server |
| Tooling | npm workspaces, concurrently, cross-env |

---

## Project structure

```text
E-Commerce/
├── package.json                  # Workspaces, start/build/seed/test scripts
├── package-lock.json
├── README.md
├── backend/
│   ├── .env.example              # API environment template
│   ├── package.json
│   ├── tests/
│   │   └── api.test.js           # End-to-end API tests (in-memory MongoDB)
│   └── src/
│       ├── app.js                # Express app, security, static SPA serving
│       ├── server.js             # Database connection + graceful shutdown
│       ├── config/               # Environment and Mongoose connection
│       ├── controllers/          # Auth, product, and order logic
│       ├── data/                 # Seed products, reviews, order blueprints
│       ├── middleware/           # Auth, validation, errors, rate limits
│       ├── models/               # User, Product, Order schemas
│       ├── routes/               # Versioned API routes
│       ├── scripts/seed.js       # Database seeder / reset
│       ├── utils/                # Pricing, pagination, errors, tokens
│       └── validators/           # Request validation chains
└── frontend/
    ├── .env.example              # Optional API base URL override
    ├── index.html
    ├── vite.config.js            # Dev server + /api proxy to port 5000
    ├── tailwind.config.js
    ├── public/
    │   ├── favicon.svg
    │   └── placeholder.svg       # Local image fallback
    └── src/
        ├── main.jsx              # Providers and router bootstrap
        ├── App.jsx               # Storefront, auth, and admin routes
        ├── api/                  # Axios client and endpoint modules
        ├── components/           # Reusable UI and layout components
        ├── context/              # Auth, cart, and toast providers
        ├── pages/                # Storefront pages
        │   └── admin/            # Dashboard, products, orders
        └── utils/                # Currency/date formatting and cart totals
```

---

## Prerequisites

- **Node.js 20.19+** and npm 10+.
- **MongoDB 6+** running locally, in Docker, or a MongoDB Atlas connection string.
- Optional: Docker Desktop if you prefer containerized MongoDB.

Check your versions:

```bash
node --version
npm --version
```

---

## Quick start

### 1. Install dependencies

From the repository root:

```bash
npm install
```

This installs dependencies for the root, backend, and frontend workspaces.

### 2. Create the backend environment file

**macOS / Linux / Git Bash**

```bash
cp backend/.env.example backend/.env
```

**Windows PowerShell**

```powershell
Copy-Item backend/.env.example backend/.env
```

Then edit `backend/.env` and set at least `MONGO_URI` and a strong `JWT_SECRET`.

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Start MongoDB

Use an existing local MongoDB instance:

```text
mongodb://127.0.0.1:27017/luma
```

Or start one with Docker:

```bash
docker run -d --name luma-mongo -p 27017:27017 -v luma-mongo-data:/data/db mongo:7
```

Or use MongoDB Atlas and place the SRV connection string in `MONGO_URI`.

### 4. Seed demo data

```bash
npm run seed
```

This creates the admin and customer accounts, 16 products, sample reviews, and three orders. It is safe to re-run: existing products are skipped, while demo accounts are refreshed.

To wipe all users, products, and orders:

```bash
npm run seed:destroy
```

### 5. Run the application

```bash
npm start
```

This uses `concurrently` to start:

| Service | URL |
| --- | --- |
| Storefront | http://localhost:5173 |
| API | http://localhost:5000 |
| Health check | http://localhost:5000/api/v1/health |
| Admin studio | http://localhost:5173/admin |

`npm run dev` is an alias for `npm start`.

---

## Environment variables

### Backend — `backend/.env`

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | API port |
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |
| `MONGO_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Token signing secret; use 32+ random characters in production |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin(s); comma-separated |
| `SEED_ADMIN_NAME` | No | `Admin User` | Seeded admin name |
| `SEED_ADMIN_EMAIL` | No | `admin@luma.dev` | Seeded admin email |
| `SEED_ADMIN_PASSWORD` | No | `Admin123!` | Seeded admin password |
| `SEED_USER_NAME` | No | `Demo Customer` | Seeded customer name |
| `SEED_USER_EMAIL` | No | `demo@luma.dev` | Seeded customer email |
| `SEED_USER_PASSWORD` | No | `Demo123!` | Seeded customer password |

### Frontend — `frontend/.env` (optional)

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `/api/v1` | API base URL. Leave unset in development so Vite proxies `/api` to `http://localhost:5000`. |

> `VITE_*` variables are embedded at build time. Rebuild the frontend after changing them.

---

## Demo accounts

Created by `npm run seed` (override with the `SEED_*` variables):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@luma.dev` | `Admin123!` |
| Customer | `demo@luma.dev` | `Demo123!` |

The admin account can access `/admin`. The customer account can browse, place orders, and manage its profile.

---

## Available scripts

### Root

| Command | Description |
| --- | --- |
| `npm start` | Run API and Vite dev server together |
| `npm run dev` | Alias for `npm start` |
| `npm run build` | Build the frontend for production |
| `npm run seed` | Seed demo data |
| `npm run seed:destroy` | Remove all seeded data |
| `npm test` | Run the backend test suite |
| `npm run start:prod` | Build the frontend and start the API in production mode |

### Backend (`backend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start API with `node --watch` |
| `npm start` | Start API without watch mode |
| `npm run seed` | Seed demo data |
| `npm run seed:destroy` | Destroy seeded data |
| `npm test` | Run Node test runner suite |

### Frontend (`frontend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite on port 5173 |
| `npm run build` | Production build to `frontend/dist` |
| `npm run preview` | Preview the production build on port 4173 |

---

## How it works

### Authentication and authorization

- Registration hashes passwords with bcrypt (cost 12) and returns a JWT.
- The frontend stores the token in `localStorage` under `luma_token`.
- Axios attaches `Authorization: Bearer <token>` to every request.
- A `401` clears the token and notifies `AuthContext`.
- `protect` verifies the token and loads the current user; `authorize('admin')` protects admin endpoints.
- Admin routes are wrapped by `AdminRoute`; customer-only routes are wrapped by `ProtectedRoute`.

### Pricing and checkout

All totals are recalculated on the server from database prices:

- Tax: **8%** of the items subtotal.
- Shipping: **$9.99**, free when the items subtotal is **$100 or more**.
- Payment: **cash on delivery** only.
- The client sends product IDs and quantities; it cannot set prices or totals.

### Inventory

Stock is reserved with atomic conditional updates before the order is saved:

```js
Product.updateOne(
  { _id, stock: { $gte: quantity } },
  { $inc: { stock: -quantity } }
);
```

If any reservation or order save fails, already-reserved stock is restored. Cancelling a `pending` or `processing` order also returns its items to inventory.

### Order lifecycle

```text
pending → processing → shipped → delivered
```

- Each transition is validated; skipping a step or moving backwards is rejected.
- Cancellation is allowed only while `pending` or `processing`.
- Admin status changes and payments are recorded with timestamps.
- `statusHistory` powers the customer and admin timelines.

### Product visibility

- Public product endpoints only return `isActive: true` products.
- Admin endpoints can read inactive products and filter by `active=true|false`.
- Deleting a product removes it from the catalogue; orders keep their own item snapshots.

### Error and response shapes

Successful single resource:

```json
{ "success": true, "data": { } }
```

Successful list:

```json
{ "success": true, "data": [], "pagination": { "page": 1, "limit": 12, "total": 16, "pages": 2 } }
```

Authentication:

```json
{ "success": true, "token": "…", "user": { } }
```

Errors:

```json
{
  "success": false,
  "message": "Please check the highlighted fields and try again.",
  "errors": [{ "field": "email", "message": "Please enter a valid email address." }]
}
```

### API rate limits

- Authentication endpoints: 30 attempts per 15 minutes per IP in development/production.
- API-wide: 1,000 requests per 15 minutes per IP.
- Limits are effectively disabled during tests for deterministic results.

---

## API reference

Base URL: `http://localhost:5000/api/v1`

### System

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | API health check |

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create an account |
| POST | `/auth/login` | Public | Sign in and receive a JWT |
| GET | `/auth/me` | Private | Current user |
| PUT | `/auth/me` | Private | Update name, email, phone |
| PUT | `/auth/password` | Private | Change password |

### Products

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/products` | Public | List active products |
| GET | `/products/categories` | Public | Categories with counts |
| GET | `/products/:id` | Public | Active product by ID |
| POST | `/products/:id/reviews` | Private | Add one review per user |
| GET | `/products/admin/all` | Admin | List all products, including inactive |
| GET | `/products/admin/:id` | Admin | Read any product |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

Product list query parameters: `keyword`, `category`, `minPrice`, `maxPrice`, `minRating`, `inStock=true`, `featured=true`, `sort` (`newest`, `oldest`, `price-asc`, `price-desc`, `rating`, `name`), `page`, `limit` (max 100). Admin list also accepts `active=true|false`.

### Orders

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/orders` | Private | Place an order |
| GET | `/orders/mine` | Private | Current user's orders (paginated) |
| GET | `/orders/:id` | Private/Admin | Order detail (owner or admin) |
| PATCH | `/orders/:id/cancel` | Private/Admin | Cancel pending/processing order |

`GET /orders/mine` accepts `status`, `page`, and `limit` (default 10).

### Admin

All `/admin` routes require an admin JWT.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/admin/stats` | Dashboard totals, status breakdown, low stock, recent orders, monthly revenue |
| GET | `/admin/orders` | All orders; accepts `status`, `keyword`, `page`, `limit` (default 15) |
| PATCH | `/admin/orders/:id/status` | Move order to `processing`, `shipped`, or `delivered`; optional `note` |
| PATCH | `/admin/orders/:id/pay` | Mark an order as paid |

---

## Testing from the terminal

The API must be running (`npm start`) and the database seeded for these examples. Examples use Bash/Git Bash with Node available for JSON parsing. In Windows PowerShell, use `curl.exe` or `Invoke-RestMethod` instead of the `curl` alias.

### 1. Health check

```bash
curl http://localhost:5000/api/v1/health
```

### 2. Sign in as the demo customer

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@luma.dev","password":"Demo123!"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")

echo "$TOKEN"
```

### 3. Read the current profile

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/v1/auth/me
```

### 4. Browse products

```bash
curl "http://localhost:5000/api/v1/products?limit=3&sort=price-asc"
```

### 5. Place an order

```bash
PRODUCT_ID=$(curl -s "http://localhost:5000/api/v1/products?limit=1" \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).data[0]._id")

curl -X POST http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [{ \"product\": \"$PRODUCT_ID\", \"quantity\": 1 }],
    \"shippingAddress\": {
      \"fullName\": \"Demo Customer\",
      \"phone\": \"+1 555 010 2030\",
      \"address\": \"1200 Market Street\",
      \"city\": \"San Francisco\",
      \"postalCode\": \"94103\",
      \"country\": \"United States\"
    },
    \"paymentMethod\": \"cod\"
  }"
```

### 6. View your orders

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/v1/orders/mine"
```

### 7. Sign in as admin and read dashboard stats

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luma.dev","password":"Admin123!"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")

curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:5000/api/v1/admin/stats
```

### PowerShell equivalent for sign-in

```powershell
$login = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5000/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"demo@luma.dev","password":"Demo123!"}'

$headers = @{ Authorization = "Bearer $($login.token)" }
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/orders/mine" -Headers $headers
```

---

## Automated tests

```bash
npm test
```

The suite uses `mongodb-memory-server`, so **no local MongoDB is required**. It boots the real Express app, connects to an ephemeral database, and covers:

- Health endpoint.
- Registration validation, password hashing, and duplicate email conflict.
- Incorrect-password rejection.
- Profile updates (including clearing an optional phone number).
- Authentication and admin authorization.
- Admin product CRUD and inactive-product visibility.
- Server-side order totals, stock reservation, and fulfilment transitions.
- Order cancellation and stock restoration.
- Insufficient-stock rejection with no inventory change.
- Validation of order payloads and malformed identifiers.

On a clean machine, the first test run downloads a MongoDB binary for the in-memory server and can take a minute or two. Later runs are faster.

Build verification:

```bash
npm run build
```

This compiles the frontend into `frontend/dist/`.

---

## Production deployment

1. Set production environment variables in `backend/.env`:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=<at-least-32-random-characters>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-domain.example
```

2. Build and start:

```bash
npm run start:prod
```

`start:prod` builds the frontend, then starts the API with `NODE_ENV=production`. When `frontend/dist` exists, Express serves the built SPA and falls back to `index.html` for client-side routes. Unknown `/api` paths still return JSON 404 responses.

3. If the frontend is hosted separately, set `VITE_API_URL` to the public API base URL **before** building, and add the frontend origin to `CLIENT_URL`.

Operational notes:

- Use a managed MongoDB instance with backups and authentication enabled.
- Run behind HTTPS (a reverse proxy or platform load balancer).
- `JWT_SECRET` must be at least 32 characters in production; the API refuses to boot otherwise.
- Adjust `CLIENT_URL` for every deployed frontend origin, comma-separated if needed.
- The built frontend currently ships as a single bundle; code-splitting admin routes is a reasonable next optimization.
- Cash on delivery is the only supported payment method. Integrating a payment provider would require server-side payment verification before marking an order paid.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Missing required environment variable(s)` | Create `backend/.env` from `backend/.env.example` and set `MONGO_URI` and `JWT_SECRET`. |
| `MongoDB connection error` | Start MongoDB, start the Docker container, or update `MONGO_URI` for Atlas. |
| Port 5000 or 5173 already in use | Stop the conflicting process or change `PORT` / the Vite port and proxy target. |
| CORS error in the browser | Set `CLIENT_URL` to the exact frontend origin, including the port. |
| Requests return 401 | Sign in again; the token may be expired. Tokens last 7 days by default. |
| Admin area redirects to the storefront | The signed-in account is not an admin. Use `admin@luma.dev` after seeding. |
| Products show the local placeholder | The remote image URL is invalid or blocked; replace it with a direct https image URL. |
| First `npm test` is slow | `mongodb-memory-server` downloads a MongoDB binary once. Ensure network access. |
| Windows `curl` behaves differently | Use `curl.exe` or the PowerShell `Invoke-RestMethod` example above. |
| `npm start` shows database errors | The API cannot connect to MongoDB; the Vite server may still start, but API requests will fail until the database is available. |

---

## Data and design notes

- Product images use Unsplash URLs; `SmartImage` falls back to `public/placeholder.svg` when loading fails.
- Typography uses Google Fonts (Inter and Plus Jakarta Sans) via `index.html`.
- Demo content, accounts, and order blueprints live in `backend/src/data/seedData.js`.
- No external chart library is used; dashboard charts are responsive CSS bars.
- The API is versioned under `/api/v1` so future breaking changes can be introduced alongside the current contract.

---

Built with care for a clean shopping experience and an equally clean admin workflow.
