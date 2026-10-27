import { test, expect } from '@playwright/test';
import { loginAs, expectLoggedInAs } from './fixtures/auth';

/**
 * Excel module: "Autenticación" + "Usuarios" (10 cases).
 */

const ADMIN = { phone: '3194499688', password: 'CajaFacil2026!' };
const WORKER_A = { phone: '3000000020', password: 'E2eWorker123', username: 'e2e_worker_a' };

test.describe('Autenticación', () => {
  test('Login exitoso', async ({ page }) => {
    await loginAs(page, ADMIN.phone, ADMIN.password);
    await expectLoggedInAs(page, 'ADMIN');
  });

  test('Login con contraseña incorrecta', async ({ page }) => {
    await loginAs(page, WORKER_A.phone, 'ContraseñaIncorrecta123');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Usuario o contraseña incorrecto')).toBeVisible();
  });

  test('Login con teléfono inexistente', async ({ page }) => {
    await loginAs(page, '3009999999', 'CualquierPassword123');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Usuario o contraseña incorrecto')).toBeVisible();
  });

  test('Usuario inactivo no puede iniciar sesión', async ({ page }) => {
    // Deactivate the worker as admin first.
    await loginAs(page, ADMIN.phone, ADMIN.password);
    await expectLoggedInAs(page, 'ADMIN');
    await page.goto('/user/admin/user');
    await page.getByPlaceholder('Buscar por nombre, username, email, rol o sede...').fill(WORKER_A.username);
    await page.locator('tr', { hasText: WORKER_A.username }).locator('button').first().click();
    await page.getByRole('switch').uncheck();
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    // Now try to log in as that (now inactive) worker.
    await page.goto('/login');
    await loginAs(page, WORKER_A.phone, WORKER_A.password);
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    // Reactivate so later modules can use this worker normally.
    await loginAs(page, ADMIN.phone, ADMIN.password);
    await page.goto('/user/admin/user');
    await page.getByPlaceholder('Buscar por nombre, username, email, rol o sede...').fill(WORKER_A.username);
    await page.locator('tr', { hasText: WORKER_A.username }).locator('button').first().click();
    await page.getByRole('switch').check();
    await page.getByRole('button', { name: 'Guardar' }).click();
  });
});

test.describe('Usuarios', () => {
  test('Un ADMIN puede ver y usar Gestión de Usuarios', async ({ page }) => {
    await loginAs(page, ADMIN.phone, ADMIN.password);
    await page.goto('/user/admin/user');
    await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nuevo Usuario' })).toBeVisible();
  });

  test('Un usuario normal NO puede acceder a rutas de administrador', async ({ page }) => {
    await loginAs(page, WORKER_A.phone, WORKER_A.password);
    await expectLoggedInAs(page, 'USER');
    await page.goto('/user/admin/dashboard');
    await expect(page).not.toHaveURL(/\/user\/admin\/dashboard/, { timeout: 10_000 });
  });

  test('Crear usuario con rol USER exige asignar una sede', async ({ page }) => {
    await loginAs(page, ADMIN.phone, ADMIN.password);
    await page.goto('/user/admin/user');
    await page.getByRole('button', { name: 'Nuevo Usuario' }).click();
    await page.getByLabel('Username').fill('e2e_temp_user');
    await page.getByLabel('Nombre').fill('Temporal');
    await page.getByLabel('Apellido').fill('DePrueba');
    await page.getByLabel('Email').fill('e2e.temp@test.local');
    await page.getByLabel('Teléfono').fill('3000000099');
    await page.getByLabel('Documento').fill('900000199');
    await page.getByLabel('Contraseña').fill('TempPass123');
    // Role defaults to USER and no sede is selected — Guardar must stay disabled.
    await expect(page.getByText('Para usuarios con rol USER debes seleccionar una sede.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  test('Editar perfil propio', async ({ page }) => {
    await loginAs(page, WORKER_A.phone, WORKER_A.password);
    await page.goto('/user/user');
    // Guardar cambios stays disabled while the form matches the stored
    // value, so a fixed string would fail on a second run against already-
    // edited data — use a value guaranteed to differ every time instead.
    const newLastName = `WorkerA-Editado-${Date.now()}`;
    const lastNameField = page.getByLabel('Apellido');
    await lastNameField.fill(newLastName);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await page.getByRole('button', { name: 'Sí, guardar' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.reload();
    await expect(page.getByLabel('Apellido')).toHaveValue(newLastName);
  });

  test('Un usuario normal no puede editar su propio teléfono/email', async ({ page }) => {
    await loginAs(page, WORKER_A.phone, WORKER_A.password);
    await page.goto('/user/user');
    await expect(page.getByLabel('Teléfono')).toBeDisabled();
    await expect(page.getByLabel('Email')).toBeDisabled();
  });

  test('Un ADMIN puede cambiar la contraseña de otro usuario', async ({ page }) => {
    const newPassword = 'NuevaPass456';
    await loginAs(page, ADMIN.phone, ADMIN.password);
    await page.goto('/user/admin/user');
    await page.getByPlaceholder('Buscar por nombre, username, email, rol o sede...').fill(WORKER_A.username);
    await page.locator('tr', { hasText: WORKER_A.username }).locator('button').first().click();
    await page.getByLabel('Nueva contraseña (opcional)').fill(newPassword);
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    // Confirm the new password works, then restore the original for later modules.
    await page.goto('/login');
    await loginAs(page, WORKER_A.phone, newPassword);
    await expectLoggedInAs(page, 'USER');

    await page.goto('/login');
    await loginAs(page, ADMIN.phone, ADMIN.password);
    await page.goto('/user/admin/user');
    await page.getByPlaceholder('Buscar por nombre, username, email, rol o sede...').fill(WORKER_A.username);
    await page.locator('tr', { hasText: WORKER_A.username }).locator('button').first().click();
    await page.getByLabel('Nueva contraseña (opcional)').fill(WORKER_A.password);
    await page.getByRole('button', { name: 'Guardar' }).click();
  });
});
