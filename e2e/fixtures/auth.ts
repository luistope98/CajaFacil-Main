import { Page, expect } from '@playwright/test';

/**
 * Logs in through the real UI form (not an API shortcut) — this exercises
 * the actual login flow and leaves the browser context with the same
 * cookies/localStorage a real user session would have.
 *
 * Waits for the login attempt to settle (either the post-login redirect, or
 * the inline error message) before returning. This matters because the real
 * redirect happens inside a `setTimeout(..., 100)` in useLogin.ts — without
 * waiting here, a caller's next full navigation (page.goto) can race ahead
 * of the auth cookies actually being set, and get bounced back to /login.
 */
export async function loginAs(page: Page, phone: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('login-phone-input').fill(phone);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  const redirected = page
    .waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 10_000 })
    .catch(() => null);
  const errored = page
    .getByText('Usuario o contraseña incorrecto')
    .waitFor({ state: 'visible', timeout: 10_000 })
    .catch(() => null);
  await Promise.race([redirected, errored]);
}

export async function expectLoggedInAs(page: Page, role: 'ADMIN' | 'USER') {
  const expectedPath = role === 'ADMIN' ? '/user/admin/dashboard' : '/user/dashboard';
  await expect(page).toHaveURL(new RegExp(expectedPath.replace('/', '\\/')), { timeout: 10_000 });
}
