# TASKS

`[ ]` todo · `[~]` doing (one only) · `[x]` done + verified · `[!]` blocked + reason · 1 session = 1 line · handoff format in `docs/ORCHESTRATION.md`

- [x] 0.1 Lock `STACK.md` (next + express + postgres).
- [x] 1.1 Backend: auth, warehouses, products, stock, clients, orders, deliveries, payments, audits, agents, leads, dashboard.
- [x] 1.2 Frontend: landing (uz), login, CRM dashboard + module pages.
- [x] 1.3 Docker Compose local run, seed admin/admin123 + demo data.
- [ ] 2.1 Telegram bot (orders + akt sverki for outlets).
- [ ] 2.2 Mobile agent app (PWA) — route, visit, photo report.
- [ ] 2.3 PIVOT report builder + Excel export.
- [x] 2.4 Roles UI + management: `/dashboard/staff` (create cabinet with login/password, role cards, edit, reset password, block/activate, revoke sessions, roles × permissions matrix), `/dashboard/profile` (own data, password change, my rights, activity), `/dashboard/activity` (audit log), login lockout.
  - handoff: migration 004 (`users.email/last_login_at/password_changed_at/token_version`, `activity_log`). `requireAuth` now reads role/active/token_version from DB → role change, block, reset, revoke apply instantly. API smoke 51/51 ×3 (incl. concurrent admin demotion, lockout 429) + 2.5/2.6 smokes green. Roles stay the fixed 5 (no custom permission editor). UI rows `STF-*`, `PRF-*`, `ACT-*` go into 3.4c.
- [x] 2.5 Integrations: Power BI, Google Sheets, SAP B1, 1C, Bitrix24, amoCRM, iiko, Spot2D, telephony, Telegram, webhook (Zapier/Make/n8n).
  - handoff: API smoke 51/51 ×3 (local webhook, feeds, 1C, PBX, Spot2D, roles). Not verified against real SAP/Bitrix/amo/iiko/Spot2D accounts; Spot2D CSV columns need confirmation from Spot2D support. UI rows `INT-*` go into 3.4c.
- [x] 2.6 Integrations: Payme, Click (merchant callbacks + payment links), Didox e-faktura (Soliq) + INN lookup, MoySklad import, Uzum Market stock sync, Eskiz SMS.
  - handoff: migration 003 (payme/click methods, client `inn`, product `ikpu`/`package_code`/`vat_rate`, `payment_transactions`). API smoke 60/60 ×3 (Payme full JSON-RPC incl. expiry, Click sign flow, links, INN lookup errors, new fields, roles) + 2.5 smoke 51/51 ×3. Not verified against real Payme Sandbox, Click, Didox, MoySklad, Uzum, Eskiz accounts; Uzum v2 FBS stock paths and Didox create-response id field need confirmation. UI rows `PAY-*`, `INT-11..13` go into 3.4c.
- [ ] 3.1 Lighthouse 100 on `/` and `/login`.
- [ ] 3.2 Named tests (orders stock reservation, audit approve).
- [ ] 3.3 Deploy (VPS) — remove default admin, HTTPS.
- [ ] 3.4a E2E setup: Playwright config, fixtures, factories, global-setup + `AUTH-*`, `G-*` rows (`docs/TESTING.md`).
- [ ] 3.4b E2E P0 money/stock: `STK-*`, `ORD-*`, `FIN-*`, `CLI-*`, `AUD-*` + their `L*` rows.
- [ ] 3.4c E2E P1: `WH-*`, `PRD-*`, `DLV-*`, `DSH-*`, `PUB-01`, `INT-*` + their `L*` rows.
- [ ] 3.4d E2E P2–P3: `PUB-02..06`, `AGT-*`, `INS-*`, `LEAD-*`.
- [ ] 3.4e API rows: `API-AUTH`, `API-<MOD>` for every mutating route + invariant break attempts.
