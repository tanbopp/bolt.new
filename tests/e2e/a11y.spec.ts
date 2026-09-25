import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { createConfirmedUser, deleteUser, gotoHydrated, uniqueTestEmail } from '../fixtures/test-user';

/**
 * Audit aksesibilitas (axe-core) untuk halaman auth & account — K2.3 (dark mode)
 * dan K2.5 (kontras WCAG AA, 0 critical/serious).
 *
 * Axe-core dijalankan dari `node_modules` (devDependency `axe-core`), jadi audit
 * ini repeatable tanpa ekstensi browser.
 */

const PASSWORD = 'Password123!';

const axeSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'node_modules', 'axe-core', 'axe.min.js'),
  'utf8',
);

type AxeViolation = {
  id: string;
  impact: string | null;
  help: string;
  targets: string[];
  summaries: string[];
};

async function auditPage(page: Page): Promise<AxeViolation[]> {
  await page.addScriptTag({ content: axeSource });

  return page.evaluate(async () => {
    const axe = (
      window as unknown as {
        axe: {
          run: (
            context: Document,
            options?: Record<string, unknown>,
          ) => Promise<{
            violations: {
              id: string;
              impact: string | null;
              help: string;
              nodes: { target: string[]; failureSummary?: string }[];
            }[];
          }>;
        };
      }
    ).axe;

    const result = await axe.run(document, { resultTypes: ['violations'] });

    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      targets: violation.nodes.map((node) => node.target.join(' ')),
      summaries: violation.nodes.map((node) => node.failureSummary ?? ''),
    }));
  });
}

async function applyTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.evaluate((value) => {
    document.querySelector('html')?.setAttribute('data-theme', value);
    window.localStorage.setItem('bolt_theme', value);
  }, theme);
}

for (const path of ['/login', '/signup']) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${path} bersih dari pelanggaran axe (${theme})`, async ({ page }) => {
      await gotoHydrated(page, path);
      await applyTheme(page, theme);

      const violations = await auditPage(page);

      expect(violations, `axe violations:\n${JSON.stringify(violations, null, 2)}`).toEqual([]);
    });
  }
}

test('/account bersih dari pelanggaran axe (light & dark)', async ({ page }) => {
  const user = await createConfirmedUser({ email: uniqueTestEmail('a11y'), password: PASSWORD, name: 'A11y User' });

  try {
    await gotoHydrated(page, '/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Masuk' }).click();
    await page.waitForURL('/', { timeout: 60_000 });

    await gotoHydrated(page, '/account');
    await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible();

    const lightViolations = await auditPage(page);
    expect(lightViolations, `axe violations (light):\n${JSON.stringify(lightViolations, null, 2)}`).toEqual([]);

    await applyTheme(page, 'dark');

    const darkViolations = await auditPage(page);
    expect(darkViolations, `axe violations (dark):\n${JSON.stringify(darkViolations, null, 2)}`).toEqual([]);
  } finally {
    await deleteUser(user.id);
  }
});
