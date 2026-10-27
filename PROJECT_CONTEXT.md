# Caja Fácil — Frontend Project Context

This document describes the MVP scope, current implementation status, and
known gaps of the web app. It exists so anyone picking up the project can
tell what is in scope, what is built, and what is a placeholder, without
having to reconstruct that from commit history.

**Status as of 2026-09-29**: `main` is byte-identical (in file content) to
the commit audited in August 2026 — the PR #60 merge since then introduced
no code changes (it reconciled a stale `dev` branch with no new commits).
Everything below reflects the current, audited state of the codebase.

## What this is

The web client for a point-of-sale (POS) system aimed at small Colombian
retail businesses (tiendas de barrio). Next.js (App Router) + MUI, talking
to the `caja-facil-backend` NestJS API. See that repo's `PROJECT_CONTEXT.md`
for the backend/data-model side of the same scope.

## MVP scope (original plan) and where it lives

1. **Users & POS** — managed directly against the database; there is no
   self-service signup UI. Admin screens: `app/user/admin/user/page.tsx`
   (user CRUD) and `app/user/admin/pos/page.tsx` (POS/sede CRUD:
   name, address, NIT, phone, `minStock`, `minCash`, `openingBalance`).
2. **Caja for the user's POS**
   - Create/edit a movement (`INCOME`/`EXPENSE`) with amount, description,
     and — for `INCOME` — a product list with quantities:
     `app/user/register/components/RegisterForm.tsx`, opened from
     `app/user/caja/page.tsx` (own POS) and `app/user/admin/caja/page.tsx`
     (admin, with a POS selector).
   - List movements by date range (day/week/month presets resolve to a
     range), paginated, with range-wide totals: same two pages, via
     `RegisterStats`/`RegisterTable`.
   - Edit a movement by id: same `RegisterForm`, reused for edit.
   - Soft-delete a movement by id: confirm dialog on both caja pages.
3. **Product** — full CRUD, list, update, delete:
   `app/user/products/page.tsx` (own POS) and
   `app/user/admin/products/page.tsx` (admin, POS selector), sharing
   `app/components/products/ProductModal.tsx` / `ProductsTable.tsx`.
4. **Inventory movement** — read stock and adjust quantity:
   `app/user/inventario/page.tsx` and `app/user/admin/inventario/page.tsx`
   (the admin one adds a "movement history" tab), via
   `app/components/inventory/InventoryTable.tsx` /
   `StockAdjustmentModal.tsx`.
5. **Alerts**
   - Low stock: red chip + warning icon in `InventoryTable.tsx` when
     `stock <= minStock`. **Known gap**: `app/user/admin/inventario/page.tsx`
     doesn't pass the `minStock` prop to `InventoryTable`, so the chip never
     triggers on that specific screen (pre-existing, not a regression).
   - Low cash balance: `app/user/dashboard/page.tsx` reads
     `isBelowMinCash` from the backend and highlights the balance KPI in
     red with a "⚠ BALANCE (BAJO MÍN)" row. Not surfaced on the admin
     dashboard.
6. **Reports** — **`app/user/reports/page.tsx` is a placeholder** ("Esta
   sección aún no está lista"), despite the admin dashboard linking to it as
   if it had "reportes consolidados, rendimiento por sede". The one real
   report today is the "Descargar Reporte" button on
   `app/user/dashboard/page.tsx`, which downloads the weekly PDF from the
   backend.

## What was added on top of the original scope

- **Laser barcode scanner, keyboard-wedge style.** Lives inside
  `app/user/register/components/RegisterForm.tsx` as an auto-focused text
  input (`barcodeInputRef`): the scanner types the SKU and sends Enter,
  the form looks the product up (`productService.searchProducts`, matching
  `skus.sku`) and adds it as a line with quantity 1. There is no camera or
  `BarcodeDetector` API involved, and no dedicated reusable component — it's
  inline in `RegisterForm`. This shipped before the August audit (it's not
  unreviewed scope creep).
- **`PURCHASE` movements** (inventory restocking), via
  `app/user/caja/components/PurchaseModal.tsx` — separate from
  `RegisterForm`, which explicitly blocks editing a `PURCHASE` register and
  points the user at this modal instead.
- **Bulk product import from Excel** + downloadable template, and
  **multiple SKUs per product** (`ProductModal.tsx`).
- **Shared tax math** (`app/utils/tax.ts`) mirroring the backend's IVA/ICO
  formula exactly, used by `RegisterForm`, `PurchaseModal`, and
  `ProductModal` so the UI preview always matches what the backend will
  actually charge.

## Explicitly out of scope / known placeholders

- **DIAN electronic invoicing** — same note as the backend: the PDF is an
  internal receipt, not a legal electronic invoice.
- **`app/user/reports/page.tsx`** — placeholder, see above.
- **`app/terms/page.tsx`** — has Lorem-ipsum filler text, not real terms.
- **`app/page.tsx`** — default `create-next-app` boilerplate; harmless
  because `next.config.ts` redirects `/` straight to `/login` before it
  would ever render.
- **Self-service password change** — matches the backend limitation; a
  user's own password can only be changed by an `ADMIN` from "Gestión de
  Usuarios", not from "Mi perfil".

## Deployment

EasyPanel has two services configured to auto-deploy on push — **`main` →
production**, **`dev` → staging**. Each points at its own backend/database
pair, so a deploy to one never touches the other. See the backend's
`PROJECT_CONTEXT.md` for what happens on the API side on every deploy
(migrations + admin-account seeding run automatically on boot).

## Testing

Jest + React Testing Library (`jest.config.js` via `next/jest`,
`jest.setup.js`, `types/jest.d.ts`). Run with `npm test`. Current coverage:
`app/utils/tax.test.ts` (the shared tax formula) and
`app/user/register/components/{RegisterForm,RegisterStats}.test.tsx`
(3 suites / 14 tests). This is not full coverage of the app — it's the
caja/tax-critical path from the last hardening pass.
