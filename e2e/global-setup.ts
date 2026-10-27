import { request as newRequest } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Seeds fixtures for the whole e2e run through the real HTTP API (not direct
 * DB access), authenticated as one of the super-admin accounts the backend
 * already seeds on boot (see prisma/seed.ts in caja-facil-backend). Writes
 * the created ids/credentials to fixtures/seeded.json for spec files to read.
 *
 * Runs once before all test files — and on every single `npx playwright
 * test` invocation across this whole campaign (one per Excel module, plus
 * re-runs). So this is idempotent at the file level: if fixtures/seeded.json
 * already exists, it's reused as-is instead of creating a second set of
 * POS/products/workers. Delete that file to force a fresh reseed.
 *
 * The backend is expected to already be running on :4000 against the
 * dedicated `caja_facil_e2e` database — see e2e/README.md for how to start it.
 */

const API_URL = 'http://localhost:4000';
const ADMIN_PHONE = '3194499688'; // Samuel — seeded by prisma/seed.ts
const ADMIN_PASSWORD = 'CajaFacil2026!';
const WORKER_PASSWORD = 'E2eWorker123';

const SEEDED_FILE = path.join(__dirname, 'fixtures', 'seeded.json');

export default async function globalSetup() {
  if (fs.existsSync(SEEDED_FILE)) {
    console.log(`[global-setup] Reusing existing fixtures from ${SEEDED_FILE}`);
    return;
  }

  const api = await newRequest.newContext({ baseURL: API_URL });

  const loginRes = await api.post('/auth/login', {
    data: { phone: ADMIN_PHONE, password: ADMIN_PASSWORD },
  });
  if (!loginRes.ok()) {
    throw new Error(
      `Global setup: admin login failed (${loginRes.status()}). Is the backend running on :4000 against caja_facil_e2e? ${await loginRes.text()}`,
    );
  }
  const { access_token: adminToken } = await loginRes.json();
  const authHeaders = { Authorization: `Bearer ${adminToken}` };

  const posA = await (
    await api.post('/pos', {
      headers: authHeaders,
      data: {
        name: 'E2E Sede A',
        description: 'Sede de pruebas automatizadas A',
        address: 'Calle E2E 1',
        taxId: '900000001',
        phone: '3000000010',
        minStock: 10,
        minCash: 20000,
        openingBalance: 100000,
      },
    })
  ).json();

  const posB = await (
    await api.post('/pos', {
      headers: authHeaders,
      data: {
        name: 'E2E Sede B',
        description: 'Sede de pruebas automatizadas B (ajena)',
        address: 'Calle E2E 2',
        taxId: '900000002',
        phone: '3000000011',
        minStock: 10,
        minCash: 10000,
        openingBalance: 50000,
      },
    })
  ).json();

  const categoryA = await (
    await api.post('/categories/admin', {
      headers: authHeaders,
      data: { name: 'E2E General', posId: posA.id },
    })
  ).json();

  const categoryB = await (
    await api.post('/categories/admin', {
      headers: authHeaders,
      data: { name: 'E2E General B', posId: posB.id },
    })
  ).json();

  const createProduct = async (data: Record<string, unknown>) =>
    (
      await api.post('/products-web/admin', {
        headers: authHeaders,
        data,
      })
    ).json();

  const gaseosa = await createProduct({
    name: 'E2E Gaseosa IVA+ICO',
    description: 'Producto con IVA 19% e ICO para pruebas de impuestos',
    sku: 'E2E-GASEOSA-001',
    stock: 100,
    price: 3000,
    taxRate: 19,
    icoTaxAmount: 300,
    categoryId: categoryA.id,
    posId: posA.id,
  });

  const agua = await createProduct({
    name: 'E2E Agua Sin Impuesto',
    description: 'Producto con IVA 0% para pruebas de impuestos',
    sku: 'E2E-AGUA-001',
    stock: 200,
    price: 1500,
    taxRate: 0,
    categoryId: categoryA.id,
    posId: posA.id,
  });

  // Stock (5) is already below Sede A's minStock (10) — supports the
  // low-stock alert test case without needing a separate adjustment step.
  const snackBajoStock = await createProduct({
    name: 'E2E Snack Bajo Stock',
    description: 'Producto con stock bajo el mínimo de la sede',
    sku: 'E2E-SNACK-001',
    stock: 5,
    price: 2000,
    taxRate: 19,
    categoryId: categoryA.id,
    posId: posA.id,
  });

  const productoB = await createProduct({
    name: 'E2E Producto B',
    description: 'Producto de la sede ajena, para pruebas de permisos',
    sku: 'E2E-PRODB-001',
    stock: 50,
    price: 1000,
    taxRate: 19,
    categoryId: categoryB.id,
    posId: posB.id,
  });

  const createWorker = async (data: Record<string, unknown>) =>
    (
      await api.post('/users', {
        headers: authHeaders,
        data,
      })
    ).json();

  const workerA = await createWorker({
    username: 'e2e_worker_a',
    password: WORKER_PASSWORD,
    name: 'E2E',
    lastName: 'WorkerA',
    document: '900000101',
    phone: '3000000020',
    email: 'e2e.workera@test.local',
    role: 'USER',
    posId: posA.id,
  });

  const workerB = await createWorker({
    username: 'e2e_worker_b',
    password: WORKER_PASSWORD,
    name: 'E2E',
    lastName: 'WorkerB',
    document: '900000102',
    phone: '3000000021',
    email: 'e2e.workerb@test.local',
    role: 'USER',
    posId: posB.id,
  });

  const seeded = {
    admin: { phone: ADMIN_PHONE, password: ADMIN_PASSWORD },
    workerPassword: WORKER_PASSWORD,
    posA,
    posB,
    categoryA,
    categoryB,
    products: { gaseosa, agua, snackBajoStock, productoB },
    workerA,
    workerB,
  };

  fs.mkdirSync(path.dirname(SEEDED_FILE), { recursive: true });
  fs.writeFileSync(SEEDED_FILE, JSON.stringify(seeded, null, 2));

  await api.dispose();
}
