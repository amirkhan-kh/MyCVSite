# Testing

Runner: **Playwright** (`@playwright/test`) for UI, E2E and API — one runner, no Jest/Cypress/Vitest.
Procedure (loop until 100%): `docs/skills/04-ui-testing.md`. This file = rules + matrix.

## When

| Task | What runs |
|---|---|
| Test task (`3.2`, `3.4*`, "test …") | Full matrix rows for the named scope, 3×3 rule, loop to 100% |
| Any UI change | Matrix rows of the touched screen + `G-*` rows, 3×3 rule |
| Any API change | API rows for the touched module (happy · 401 · 403 · 422 · 409) |
| Docs-only / copy-only | typecheck only |

## The 3×3 rule

Every matrix row (one function the user can trigger) is tested in **3 states**, and every test runs **3 times**.

| State | Meaning | Typical inputs |
|---|---|---|
| **S1 — happy** | Valid action, expected result in UI **and** in data | Normal values, default role |
| **S2 — edge** | Boundary or unusual-but-valid | min/max (`0`, `1`, `50`, limit exactly), empty list, long text (120+), Uzbek apostrophes `O'g'il`, Cyrillic, spaces, keyboard-only (Tab/Enter/Esc), mobile 375px, second click / toggle back |
| **S3 — negative** | Must be rejected or handled gracefully | Missing `required`, out-of-range, duplicate (409), rule break (409), wrong role (403), no session (401), server 500 / network fail (via `page.route`), double-click submit |

3 runs: `--repeat-each=3` with `retries: 0`. A test that passes 2/3 is **flaky = failed**.
Per row: 3 states × 3 runs = **9 green executions** minimum.

## Done bar (100%)

All must be true for the scope, else keep looping:

1. Every matrix row in scope has tests tagged `[ID][S1]`, `[ID][S2]`, `[ID][S3]` (coverage command below = expected count).
2. `npm run test:e2e` → 0 failed, 0 flaky, 0 skipped, 0 `test.fixme`/`test.only`.
3. 0 console errors, 0 `pageerror`, 0 unexpected 5xx (fixture fails the test).
4. Each S1 asserts the **data effect**, not just a toast: re-read via API or reload page.
5. `npm run typecheck` green in `frontend/` and `backend/`.

A real product bug found by a test → fix it in the same task if it's inside scope (small diff); else `[!]` + new `TASKS.md` line. Never weaken an assertion to make it pass.

## Setup (first test task creates this — standing permit in `docs/STRICT.md`)

```
frontend/
  playwright.config.ts
  e2e/
    fixtures.ts          login per role (storageState), api helper, console/5xx guard, unique()
    global-setup.ts      wait /health, create storageState for admin, manager, agent, courier, auditor
    factories.ts         create warehouse/product/client/order via API with unique names
    api/*.spec.ts        API rows (request fixture)
    <screen>.spec.ts     one file per screen below
```

Config essentials:

```ts
export default defineConfig({
  testDir: "e2e",
  retries: 0,
  repeatEach: 3,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://localhost:3001", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
});
```

Scripts in `frontend/package.json`: `"test:e2e": "playwright test"`, `"test:e2e:ui": "playwright test --ui"`.
Stack: `docker compose up --build -d` (fresh: needs permit for `down -v`).

## Writing rules

- **Selectors**: `getByRole` / `getByLabel` / `getByText` with Uzbek copy. No CSS classes, no XPath. Missing accessible name → add `aria-label` in the component (that's an a11y fix), not `data-testid`.
- **Data**: seed is random — never assert seeded values (except `admin` login). Each test creates its own data via `factories.ts` with `unique()` suffix (`Date.now()` + `testInfo.repeatEachIndex`), so 3 repeats never collide on UNIQUE columns.
- **Isolation**: no test depends on another's order. Workers = 1 because the DB is shared.
- **Waits**: web-first assertions (`await expect(x).toBeVisible()`), `waitForResponse` for submits. Never `waitForTimeout` (debounce: wait for the list response).
- **Error states**: `page.route("**/api/v1/<path>*", r => r.fulfill({ status: 500, json: { error: "Server xatosi" } }))`. Loading: delay the route, assert `role=status`.
- **Native dialogs** (`confirm`): test both `dialog.accept()` and `dialog.dismiss()`.
- **Title format**: `test("[ORD-04][S3] tasdiqlash: qoldiq yetmasa xato", …)`. Tag mobile rows ` @mobile`.

## Commands

```bash
npm run test:e2e                                   # full, 3 repeats from config
npx playwright test e2e/orders.spec.ts             # one screen
npx playwright test -g "\[ORD-04\]"                # one row
npx playwright test --repeat-each=10 -g "\[ORD-04\]"   # flake hunt
npx playwright show-report                         # failures with trace
# coverage: tagged ids × states present
npx playwright test --list | rg -o "\[[A-Z]+-[0-9]+\]\[S[123]\]" | sort -u | wc -l
```

## Matrix

ID → function → what S1 / S2 / S3 must prove. **Every row = 3 states × 3 runs. Priority only orders the work; P3 is still mandatory.**

### L — list contract (apply to every list screen: WH, PRD, STK, CLI, ORD, DLV, FIN, AUD, LEAD)

Each screen gets its own copies: `WH-L1`, `PRD-L1`, …

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| L1 | Search | Match by name → only matching rows | No match → `Empty`; apostrophe/Cyrillic/spaces; clear → full list | Type fast + clear before 300ms → one final request, page reset to 1 |
| L2 | Status/category Chips | Each option filters; `aria-pressed` moves | Counts equal rows; back to "Barchasi" | Chip change on page 2 → page resets to 1 |
| L3 | Pagination | Next/prev change rows and `n / N` | Prev disabled on 1, next disabled on last; single page both disabled | Search while on last page → page 1, no empty gap |
| L4 | States | Loading `role=status` then table | Empty dataset → `Empty` text | API 500 → `ErrorState` + "Qayta urinish" recovers |

### G — global / shell (P0)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| G-01 | Route guard | Logged in → `/dashboard/*` opens | Deep link + reload keeps page | No cookie → `/login?next=<path>`; after login returns to `next` |
| G-02 | Sidebar nav (every item) | Click → URL + heading + active item | Keyboard Tab+Enter | Unknown `/dashboard/x` → not-found, no crash |
| G-03 | Mobile menu `@mobile` | "Menyuni ochish" opens, "Menyuni yopish" closes | Nav click closes menu + navigates | Open/close 3× fast → consistent state |
| G-04 | Logout "Chiqish" | → `/login`, cookie gone | Back button after logout → redirected to login | Logout API 500 → still no access to dashboard |
| G-05 | Session expiry | — valid session works | Token from another role sees only allowed actions | API 401 mid-session → redirect `/login?next=` |
| G-06 | Modal (shared) | Opens with title, X "Yopish" closes | Esc and backdrop click close; reopen shows clean form | Submit error keeps modal open with `Alert` |

### PUB — landing `/` (P1–P3)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| PUB-01 | Demo form (P1) | Valid name+phone → success; lead visible in `/dashboard/leads` | Only required fields; long company/message; `O'g'il` name | Empty required → no request; API 500 → error text; double submit → 1 lead |
| PUB-02 | Header links + "Kirish" | `#demo` scrolls, `/login` opens | Mobile header menu `@mobile` | Keyboard focus visible on each link |
| PUB-03 | Hero CTAs | `#demo`, `#agentlar`, `/login` targets | Mobile viewport `@mobile` | Anchor target exists (no dead hash) |
| PUB-04 | FAQ accordion (P3) | Click opens answer, `aria-expanded=true` | Open second item; Enter/Space toggles | 3 fast toggles → final state correct |
| PUB-05 | Contact / Telegram / Footer (P3) | `tel:` and `mailto:` hrefs valid; Telegram CTA → `#demo` | Footer links resolve | No broken link (each href 200 or anchor exists) |
| PUB-06 | SEO / meta (P2) | title, description, canonical, OG present | `/login` has unique title | No duplicate `h1`, images have `alt` |

### AUTH — `/login` (P0)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| AUTH-01 | Login submit | `admin/admin123` → `/dashboard` | Each role (`manager`, `courier1`, `auditor1`, an agent) with `demo123`; Enter key submits | Wrong password → `Alert`; empty fields → native block; API 500 → error; button disabled while loading |
| AUTH-02 | Show/hide password | Toggle → `type=text`, label "Parolni yashirish" | Toggle back → `type=password` | Toggle does not submit the form |
| AUTH-03 | `next` redirect | `?next=/dashboard/orders` → lands there | Already logged in visiting `/login` | `next=https://evil.com` → stays on-site |

### DSH — `/dashboard` (P1)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| DSH-01 | KPI cards | 8 cards render numbers | Values change after creating an order (re-visit) | API 500 → error state |
| DSH-02 | Quick links (orders, products, stock, audits, insights) | Each navigates | Keyboard activation | Role without access → handled |
| DSH-03 | Charts | Render with data | Empty data → no crash | Resize to 375px `@mobile` |

### WH — warehouses (P1) + `WH-L1..L4`

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| WH-01 | Create (Kod, Nomi, Shahar, Sig'im, Manzil, Mas'ul, Faol) | Valid → row appears | Capacity `0`; long name; optional fields empty | Duplicate Kod → 409 "Bunday yozuv allaqachon mavjud"; required empty; capacity `-1` blocked |
| WH-02 | Edit (pencil "Tahrirlash") | Change name → saved | Uncheck "Faol" → inactive badge; re-check | Clear required field → blocked; close without save → unchanged |

### PRD — products (P1) + `PRD-L1..L4`

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| PRD-01 | Create (Nomi, SKU, Kategoriya, birlik, Og'irlik, Sotuv narxi, Tannarx, Minimal qoldiq, Yaroqlilik, Sotuvda) | Valid → row + category chip | Price `0`; past expiry date; weight decimals `0.125` | Duplicate SKU → 409; negative price blocked; required empty |
| PRD-02 | Edit | Price change reflected in new order form | Uncheck "Sotuvda" → product absent from order form | Server 422 → `Alert`, modal stays |

### STK — stock (P0) + `STK-L1..L4`

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| STK-01 | Kirim | +N → quantity +N, movement row `in` | Quantity `1`; note with apostrophe | Quantity `0` blocked (`min=1`); double-click → one movement |
| STK-02 | Chiqim | −N → quantity −N, movement `out` | Remove exactly all available → `0` | More than available → error, quantity unchanged |
| STK-03 | Ko'chirish | A −N, B +N, movement `transfer` | Transfer all | Same warehouse → 422 "Ko'chirish uchun boshqa omborni tanlang" |
| STK-04 | Warehouse select "Ombor" | Filters rows | Switch back to all | Warehouse with no stock → `Empty` |
| STK-05 | "Faqat kam qoldiq" checkbox | Only rows below `min_stock` | Uncheck → all rows | Combine with search + warehouse → intersection |
| STK-06 | Movements tab/chips + pagination | Shows latest movement first | Filter by type | Page 2 then filter → page 1 |

### CLI — clients (P0) + `CLI-L1..L4`

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| CLI-01 | Create (nomi, Egasi, Telefon, Hudud, Manzil, Segment, Kredit limiti, Savdo agenti) | Valid → row | Segment A/B/C each; limit `0` (= unlimited); no agent | Required empty; limit `-1` blocked; 422 shown |
| CLI-02 | Detail page | Row click → `/dashboard/clients/[id]`, balance + orders | Back link to list | `/dashboard/clients/999999` → not-found state |
| CLI-03 | "To'lov qabul qilish" from detail | Pay → balance decreases | Pay exact debt → balance `0` | Amount `0` blocked; close modal → no payment |
| CLI-04 | Overlimit filter | `?status=overlimit` lists only overlimit | Link from finance KPI lands here | None overlimit → `Empty` |

### ORD — orders (P0) + `ORD-L1..L4`

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| ORD-01 | New order form | 1 line → created, status `new`, total correct | 3 lines; same product twice → merged qty; discount `0` and `50` | Discount `51` blocked; no product chosen; qty `0` |
| ORD-02 | Add / remove line ("Qatorni o'chirish") | Add then remove → totals update | Remove down to 1 line | Cannot submit with 0 lines |
| ORD-03 | Credit limit | Within limit → created | `balance + total == limit` → allowed | Over limit → 409 "kredit limiti oshib ketadi" |
| ORD-04 | Tasdiqlash (confirm) | `confirmed`, stock `reserved` +qty | Order using all available stock | Not enough stock → error, status stays `new` |
| ORD-05 | Yuklash modal (Kuryer, Mashina raqami) → shipped | `shipped`, stock −qty, `out` movement, client balance +total, delivery created | No courier / empty vehicle | Close modal → still `confirmed`; double submit → one movement |
| ORD-06 | Yetkazildi | `delivered`, delivery `delivered` | Reload keeps state, no action buttons | API 409 on stale tab → error shown |
| ORD-07 | Bekor qilish (`confirm`) | From `new` → `cancelled` | From `confirmed` → reserve released | `dialog.dismiss()` → no change; no cancel button after `shipped` |

### DLV — deliveries (P1) + `DLV-L1..L4`

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| DLV-01 | Courier select per row | Assign → persists after reload | Reassign to another courier | API 500 → error, old value kept |
| DLV-02 | Status buttons (yo'lda / yetkazildi / muvaffaqiyatsiz) | pending → on_route → delivered; order becomes `delivered` | Failed sets note "Mijoz qabul qilmadi" | Buttons hidden for terminal states |
| DLV-03 | KPI cards | Counts match after status change | Zero state | API error |

### FIN — finance (P0) + `FIN-L1..L4`

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| FIN-01 | Payment form (Mijoz, Summa, To'lov turi, Izoh) | Cash → row + balance down | Each method: cash, card, transfer; amount `1` | Amount `0`/negative blocked; no client; 422 |
| FIN-02 | Method chips | Filter by method | "Barchasi" | Method with no payments → `Empty` |
| FIN-03 | KPI + "Limitdan oshganlar" link | Totals update after payment | Link → clients overlimit | API error |

### AUD — audits (P0) + `AUD-L1..L4`

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| AUD-01 | New audit (Ombor, Auditor, Izoh) | Created `in_progress`, expected = stock | Warehouse with 1 product | No warehouse → blocked |
| AUD-02 | Count inputs + search | Enter counts, "saqlash" → persisted | Fill-expected button; search filters items; `0` count | Negative blocked (`min=0`); edit after complete → disabled |
| AUD-03 | Complete | All counted → `completed` | Counts equal expected → variance `0` | Uncounted → 422 "… pozitsiya hali sanalmagan" |
| AUD-04 | Approve (`confirm`) | `approved`, stock = counted, `adjust` movements | Shortage and surplus → variance KPI sign | `dialog.dismiss()` → still `completed`; approve `in_progress` impossible |

### AGT / INS / LEAD (P2)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| AGT-01 | Agents + couriers tables | Rows with plan % | Agent with plan `0` → no divide error | API error |
| INS-01 | Insights refresh | Button reloads, disabled while loading | Each finding link navigates to its href | API 500 → error + retry |
| INS-02 | Agent cards | 5 agents render | Agent with no findings → empty text | Severity badges correct colors/labels |
| LEAD-01 | Lead status select "Holat" | new → contacted persists after reload | Each value: new, contacted, won, lost | API 500 → error, value reverts |

### INT — integrations `/dashboard/integrations` (P1, admin only)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| INT-01 | Catalog "Ulash" → form | Webhook with URL → appears in "Ulangan", badge "Faol" | Provider with no fields (Google Sheets); second connection → "Ulangan × 2" | Required field empty → native block; `http://` URL → 422 `Alert`; unchecked all events allowed |
| INT-02 | Event checkboxes | Only checked events create jobs | Uncheck all → no jobs | Event not supported by provider → 422 |
| INT-03 | "Tekshirish" | Reachable target → green `role=status` message | Feed-only provider → "URL'lar tayyor" | Unreachable → red message + "Xato" badge, `last_error` shown |
| INT-04 | "Sinxronlash" (iiko, Spot2D) | Mocked success → message + "oxirgi almashinuv" | Disabled when integration inactive | Spot2D without upload URL → red message |
| INT-05 | Edit (pencil) | Rename persists | Password left empty → secret kept (signature still valid) | Clear required text field → blocked |
| INT-06 | "Batafsil" panel | Inbound URLs + copy button copies exact URL | Jobs list shows `done`; telephony shows calls | Failed job → "Qayta yuborish" → pending |
| INT-07 | "Tokenni yangilash" (`confirm`) | Accept → URLs change, old URL 404 | Dismiss → unchanged | Inactive integration URL → 404 |
| INT-08 | Delete (`confirm`) | Accept → removed with jobs | Dismiss → kept | Non-admin: nav item hidden, page/API 403 |
| INT-09 | Outbox delivery | Order/payment/lead/client/stock event reaches webhook with valid HMAC | Rolled-back write (e.g. credit-limit 409) → no job | Target down → `pending`, attempts 1, backoff; 8 fails → `failed` |
| INT-10 | Inbound: feeds, 1C, telephony, Spot2D | JSON/CSV feed rows; 1C products created→updated; stock set + `adjust` movement; call linked to client | Date range `from/to`; 1C stock same qty → 0 changed; form-encoded PBX payload | Bad token / wrong provider / unknown dataset → 404; negative qty, unknown warehouse, no phone → 422 |
| INT-11 | Payme JSON-RPC | Check → Create → Perform: payment `payme`, debt down; Cancel → state -2, debt back | Repeat Create/Perform/Cancel idempotent; GetStatement lists txn; 12h old → -31008 + state -1 reason 4 | Bad auth -32504; unknown method -32601; bad account -31050; wrong amount -31001; 2nd txn same order -31099 |
| INT-12 | Click Prepare/Complete | Prepare → id; Complete → payment `click`, debt down | Complete repeat → -4; Click `error<0` → -9, no payment | Bad sign -1; wrong action -3; unknown account -5; bad prepare id -6; amount mismatch -2 |
| INT-14 | Hero stats, category chips, search, logos | Stats match list (Ulangan/Faol/Xato/Bugun); chip "To'lov tizimlari" → only Payme, Click; every card shows its logo `img[alt$="logotipi"]` loaded (naturalWidth > 0) | Chip "Ulangan" with none → empty hint; search "soliq" → Didox; after "Ulash" success → chip switches to "Ulangan" | Search "zzz" → "Hech narsa topilmadi"; reduced motion → no float/ping animation |
| INT-13 | Didox / MoySklad / Uzum / Eskiz | Shipped order → Didox draft job; sync imports/pushes | Job error names the missing field (INN / IKPU) | Fake creds → "Tekshirish" red message, no crash |

### PAY — online payments and e-invoice fields (P1)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| PAY-01 | Client page "Onlayn to'lov havolasi" | Amount = debt prefilled → Payme + Click rows; copy button copies URL | Order number `TF-…` → Payme URL decodes to `ac.<field>=TF-…` | No payment integration → `Alert`; amount < 1000 → native block; bad order format → native block |
| PAY-02 | Copy / open link | Copy icon turns ✓ | Open link → new tab `noopener` | Clipboard denied → no crash |
| PAY-03 | Client form INN + "Soliqdan to'ldirish" | Didox on → name/director/address filled | 14-digit INN accepted; empty INN saves | 5 digits → native block / 422; Didox off → 409 `Alert`; Didox down → 502 `Alert` |
| PAY-04 | Product form IKPU / O'ram kodi / QQS | Saved and shown on edit | VAT 0 and 100 accepted; empty IKPU saves | IKPU ≠ 17 digits → block / 422; VAT 120 → 422 |
| PAY-05 | Finance chips + manual form | Chips "Payme", "Click" filter list | Ledger shows "Payme"/"Click" on client page | Manual form offers only Naqd/Karta/O'tkazma; API `method=payme` → 422 |

### STF / PRF / ACT — staff management, profile, activity (P1)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| STF-01 | "Yangi xodim" form | Name → login suggested (`gayrat.olmasov`); wand generates password; role card select → created, credentials card shows login+password, "Hammasini nusxalash" copies | Role "Savdo agenti" shows plan field, others hide it; manual login edit stops auto-suggest | Duplicate login → 409 `Alert`; password `abcdefgh` → 422; login `a b` → native block |
| STF-02 | Edit (pencil) | Role change persists, user's open session → login page | Own row: role cards disabled with hint | Clear name → native block |
| STF-03 | Reset password (key) | New password → credentials card; old password fails | Generated password strength "Kuchli" | Weak password → 422 `Alert` |
| STF-04 | Block / activate | Confirm → row grey "Bloklangan", user login → 403 message | Dismiss confirm → unchanged; activate → login works | Own row button disabled; last active admin → 409 |
| STF-05 | Revoke sessions | Confirm → user's session 401 → `/login` | Dismiss → unchanged | Revoke own → redirected to login |
| STF-06 | Filters + detail | Role chip counts match KPI; status "Bloklangan"; search by phone | Row click → detail modal with activity timeline | Non-admin: nav hidden, API 403 |
| STF-07 | "Rollar va huquqlar" tab | Matrix matches backend `allow(...)` | Active-user count per role | — |
| PRF-01 | Header avatar → `/dashboard/profile` | Hero shows role, last login, password date | Save name → header name updates without reload | Bad email → 422 `Alert` |
| PRF-02 | Password change | Correct current + new → "Parol yangilandi", other sessions 401 | Show/hide eye toggles; repeat mismatch disables submit | Wrong current → 422; same as current → 409; weak → native/422 |
| PRF-03 | "Mening huquqlarim", activity | Lists only own role rights | Activity shows admin actions on me | — |
| ACT-01 | `/dashboard/activity` | Chips Kirishlar / Xodimlar / Profil filter; search by name or IP | Pagination 15/page | 5 wrong logins → "Noto'g'ri parol" ×4 + "Kirish vaqtincha bloklandi" |
| AUTH-L | Login lockout | 6th attempt → 429 message with minutes | Correct password after lock still 429 | Blocked user → 403 "bloklangan" |

### API (Playwright `request`, per module)

| ID | Endpoint group | S1 | S2 | S3 |
|---|---|---|---|---|
| API-AUTH | `/auth/*` | login sets cookie | logout clears | bad creds 401 |
| API-<MOD> | each `/api/v1/<module>` mutating route | 200/201 + body | boundary values accepted | 401 no cookie · 403 wrong role · 422 bad body · 409 rule/duplicate |

Invariants from `docs/ARCHITECTURE.md` (stock never negative, reserve ≤ quantity, credit limit, state machine, audit approve) each need at least one API S3 test that tries to break them.

## Report

```
Check: npm run test:e2e -- <scope> → <passed>/<total> passed · flaky 0 · skipped 0
Coverage: <ids×states found>/<expected> (rg command above)
Bugs: <fixed in this task> · <new TASKS lines>
```
