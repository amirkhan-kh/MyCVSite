# Architecture

Smallest correct cut. One truth per fact. Same domain name on API, DB, and UI folder.

## Shape

```
browser ── Next.js (frontend/, :3001) ── /api/v1/* rewrite ──> Express (backend/, :4000) ── pg ──> PostgreSQL
            app/ (thin routes)                                   app.ts → modules/<domain>/router
            features/<domain>/ (screens)                         router → service → repository → db
            shared/ui, shared/lib                                core/ (auth, db, http, config, seed)
```

Auth: JWT in `tf_token` httpOnly cookie (or `Bearer`). `frontend/src/proxy.ts` redirects `/dashboard/*` → `/login?next=…` without cookie. Backend `requireAuth` on everything except `/auth/*` and `/public/leads`. Role gate: `allow(...roles)`; `admin` passes all. `requireAuth` loads `role`, `active`, `token_version` from `users` on every request (JWT carries `v`); bumping `token_version` (role change, password reset/change, block, "sessiyalarni yopish") ends all sessions of that user. Login: 5 failures per username+IP → 15 min lock (429, in-memory, single API process).

## Module map (backend `modules/` ↔ frontend `features/` ↔ route)

| Domain | Backend | UI route | Writes |
|---|---|---|---|
| auth | `auth` | `/login` | session cookie |
| dashboard | `dashboard` | `/dashboard` | — |
| insights | `insights` (service) | `/dashboard/insights` | — (read-only analysis, 5 agents) |
| warehouses | `warehouses` | `/dashboard/warehouses` | CRUD |
| products | `products` | `/dashboard/products` | CRUD |
| stock | `stock` (service) | `/dashboard/stock` | in / out / transfer movements |
| clients | `clients` | `/dashboard/clients`, `/[id]` | CRUD, balance |
| orders | `orders` (service) | `/dashboard/orders`, `/[id]` | create, status machine |
| deliveries | `deliveries` | `/dashboard/deliveries` | courier, status |
| payments | `payments` | `/dashboard/finance` | payment → balance down |
| audits | `audits` (service) | `/dashboard/audits`, `/[id]` | counts, complete, approve |
| agents | `agents` | `/dashboard/agents` | — (KPIs) |
| leads | `leads` | `/` demo form → `/dashboard/leads` | public create, status |
| users | `users` | (no UI yet — task 2.4) | CRUD |
| integrations | `integrations` (service, worker, providers/) | `/dashboard/integrations` (admin) | connections, outbox jobs, calls, 1C product/stock import |

`service.ts` exists only where a rule spans tables. Pure CRUD = router + repository.

## Invariants (never break; tests must cover)

1. **Stock**: `quantity >= 0`, `0 <= reserved <= quantity` (DB CHECK). Every change writes `stock_movements`. `idempotency_key` makes a retried move a no-op.
2. **Order state machine**: `new → confirmed | cancelled`, `confirmed → shipped | cancelled`, `shipped → delivered`. Terminal: `delivered`, `cancelled`.
   - `confirmed` reserves stock · `cancelled` from `confirmed` releases it · `shipped` consumes reserve, writes `out` movement, adds `total` to client balance, creates delivery · `delivered` marks delivery.
3. **Credit limit**: create order rejected (409) if `credit_limit > 0` and `balance + total > credit_limit`.
4. **Payment**: `amount > 0`, lowers client balance, same transaction.
5. **Audit**: `in_progress → completed` (all items counted) `→ approved` (stock set to counted, `adjust` movements). Completed audit is immutable.
6. **Money**: `NUMERIC(14,2)`, round to 2 decimals in service, never float-compare in SQL.
7. Multi-row writes run in `tx()` with `SELECT … FOR UPDATE` on the row that guards the rule.
8. **Integrations outbox**: domain writes call `emit(db, event, build)` inside their transaction → one `integration_jobs` row per subscribed active integration. Worker (`integrations/worker.ts`, 5s tick, `SKIP LOCKED` lease) delivers with backoff 30s→1h, max 8 attempts → `failed` (manual retry). Never call a remote API inside a domain transaction.
9. **Integration secrets**: `password`-type config fields are AES-256-GCM encrypted (`SECRET_KEY`, fallback `JWT_SECRET`) and returned as `********`; empty/masked value on update keeps the old secret. Inbound URLs authenticate by the 48-hex `token` (rotatable); inactive → 404.
10. **Staff management**: at least one active admin always remains (active admins locked `ORDER BY id FOR UPDATE` before the target row); an admin cannot block self or change own role. Every login, failed login/lock, profile, password and staff change writes `activity_log` in the same transaction.

## Integrations (providers)

`backend/src/modules/integrations/providers/<key>.ts` implements `Provider` (`types.ts`): `fields`, `events`, `endpoints`, `test()`, optional `push()` (outbound events) and `sync()` (manual pull/upload). Register in `catalog.ts`. External IDs (CRM deal, SAP DocEntry) live in `integration_links`.

| Provider | Direction | How |
|---|---|---|
| `payme` Payme | in | JSON-RPC Merchant API at POST `payme` (Basic `Paycom:KEY`, always HTTP 200). Account = client ID (pays debt) or `TF-…` (exact order due). Perform → `payments` row `method=payme`; cancel after perform reverts it; 12h timeout → state -1 reason 4 |
| `click` Click | in | SHOP API POST `click/prepare` + `click/complete` (form, md5 `sign_string`); same account rule, `method=click` |
| `didox` Didox (Soliq e-faktura) | out | `order.status_changed` → `shipped` creates ЭСФ 002 draft (needs client `inn`, product `ikpu` + `package_code`, `vat_rate`); user signs with E-IMZO in Didox. `GET /clients/lookup/:inn` → taxpayer card |
| `uzum_market` Uzum Market | upload | `sync()` sets FBS stock = free TradeFlow stock, match barcode/SKU title = SKU (Seller OpenAPI v2 paths — confirm in seller Swagger) |
| `moysklad` MoySklad | pull | `sync()` imports products (article/code = SKU, price ÷100) + optional stock to a warehouse code |
| `onec` 1C | in + out | POST `1c/products`, `1c/stock` (SKU / warehouse code keys); GET feeds; optional push to 1C HTTP-service |
| `sap_b1` SAP Business One | out | Service Layer: Business Partners, Orders (ItemCode = SKU), IncomingPayments |
| `powerbi` Power BI | in (+ out) | GET `feed/<dataset>` JSON; optional streaming dataset push |
| `google_sheets` Sheets/Excel | in | GET `feed/<dataset>` CSV (`=IMPORTDATA`) |
| `bitrix24`, `amocrm` | out | leads, companies, deals/sdelki with amount; status/payment as timeline notes |
| `spot2d` Spot2D | in + upload | 7 `;`-CSV files (`spot2d/<file>`), `sync()` uploads multipart |
| `iiko` iikoCloud | pull | `sync()` imports nomenclature → products by SKU |
| `telephony` PBX | in | POST `call` (JSON/form, common aliases) → calls, client match by last 9 digits, lead for unknown |
| `telegram`, `webhook` | out | messages / signed JSON (Zapier, Make, n8n) |
| `eskiz` Eskiz SMS | out | SMS to client phone (998XXXXXXXXX) on shipped / delivered / payment |

Payment links (`GET /payments/links`, `checkout.ts`) build Payme/Click checkout URLs for every active payment integration. Online payments never come from the manual form (`POST /payments` accepts cash/card/transfer only); provider transactions live in `payment_transactions` (`UNIQUE(provider, external_id)`).

## Boundaries

- Rules live in `service.ts`. SQL lives in `repository.ts`. Router = parse + authz + call + status code.
- FE route file (`app/**/page.tsx`) = metadata + one feature component. Logic in `features/<domain>`.
- `shared/ui` = dumb primitives (Button, Field, Modal, Page, Badge, States). `shared/lib` = `api`, `useApi`, `usePaged`, `format`, `status`.
- Cross-domain import only service → other repository (e.g. orders → stock, clients, deliveries). Never router → router.
- No god files (> ~300 lines → split by sub-screen), no circular imports, no packages "for scale", no second state lib, no copy-paste types drifting from API.

## Adding a module

1. `TASKS.md` line. 2. Migration `backend/migrations/00N_<name>.sql`. 3. `modules/<name>/{repository,router}.ts` (+ `service.ts` if multi-table rule). 4. Mount in `app.ts` (secured unless public). 5. `features/<name>/` + `app/dashboard/<name>/page.tsx` + nav item in `features/shell/Shell.tsx`. 6. Add rows to the UI matrix in `docs/TESTING.md`.
