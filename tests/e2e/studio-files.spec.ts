import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** UX-4 / M3-08: the Studio Files pane. */
const THEMES = ['light', 'dark', 'high-contrast', 'sap-horizon', 'sap-horizon-dark', 'sap-fiori-3', 'sap-fiori-3-dark'];

async function openStudio(page: Page, theme = 'light') {
  await page.addInitScript((t) => {
    if (!sessionStorage.getItem('eui-files-e2e')) {
      sessionStorage.setItem('eui-files-e2e', '1');
      indexedDB.deleteDatabase('eui-studio');
      localStorage.removeItem('eui-studio-panes');
    }
    localStorage.setItem('eui-docs-theme', t);
  }, theme);
  await page.goto('/studio/');
  await expect(files(page).getByRole('treeitem', { name: /^App\.tsx ?, entry/ })).toBeVisible();
}

const files = (page: Page) => page.getByRole('tree', { name: 'Project files' });
const item = (page: Page, name: RegExp) => files(page).getByRole('treeitem', { name });

test('the Files pane sits first in the left nav and its collapse state persists', async ({ page }) => {
  await openStudio(page);
  const nav = page.getByRole('navigation', { name: 'Files, components and outline' });
  const headings = nav.getByRole('heading', { level: 2 });
  await expect(headings.first()).toHaveText(/Files · 1/);
  const toggle = nav.getByRole('button', { name: 'Collapse Outline' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.click();
  await page.reload();
  await expect(nav.getByRole('button', { name: 'Expand Outline' })).toHaveAttribute('aria-expanded', 'false');
});

test('creates, renames and deletes files with the keyboard only', async ({ page }) => {
  await openStudio(page);
  await item(page, /^App\.tsx/).focus();
  await page.keyboard.press('Alt+N');
  const input = page.getByRole('textbox', { name: 'New file name' });
  await expect(input).toHaveValue('Component.tsx');
  await page.keyboard.type('Header');
  await page.keyboard.press('Enter');
  await expect(item(page, /^Header\.tsx/)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-testid="code-editor"] .view-lines')).toContainText('export default function Header()');

  // An invalid name is blocked with the exact message.
  await item(page, /^Header\.tsx/).focus();
  await page.keyboard.press('Alt+N');
  await page.keyboard.type('App');
  await page.keyboard.press('Enter');
  await expect(page.getByText('“App.tsx” already exists in src.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(item(page, /^Header\.tsx/)).toBeFocused();

  // Rename with F2.
  await page.keyboard.press('F2');
  await page.keyboard.type('TopBar');
  await page.keyboard.press('Enter');
  await expect(item(page, /^TopBar\.tsx/)).toBeVisible();

  // Delete, then undo from the toast.
  await item(page, /^TopBar\.tsx/).focus();
  await page.keyboard.press('Delete');
  await expect(item(page, /^TopBar\.tsx/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo' }).last().click();
  await expect(item(page, /^TopBar\.tsx/)).toBeVisible();
});

test('rename rewrites imports and the toast reports it', async ({ page }) => {
  await openStudio(page);
  await item(page, /^App\.tsx/).focus();
  await page.keyboard.press('Alt+Shift+N');
  await page.keyboard.type('parts');
  await page.keyboard.press('Enter');
  await expect(item(page, /^Component\.tsx/)).toBeVisible();
  // Import it from App through the code editor.
  await item(page, /^App\.tsx/).click();
  const lines = page.locator('[data-testid="code-editor"] .view-lines');
  await lines.click();
  await page.keyboard.press('ControlOrMeta+Home');
  await page.keyboard.insertText("import Component from './parts/Component';\n");
  await expect(lines).toContainText("./parts/Component");
  await item(page, /^Component\.tsx/).focus();
  await page.keyboard.press('F2');
  await page.keyboard.type('Widget');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Renamed to Widget.tsx. Updated imports in 1 file.').first()).toBeVisible();
  await item(page, /^App\.tsx/).click();
  await expect(lines).toContainText('./parts/Widget');
});

test('context menu opens with Shift+F10 and right-click and returns focus', async ({ page }) => {
  await openStudio(page);
  const app = item(page, /^App\.tsx/);
  await app.focus();
  await page.keyboard.press('Shift+F10');
  const menu = page.getByRole('menu');
  await expect(menu.getByRole('menuitem').first()).toBeFocused();
  await expect(menu.getByRole('menuitem', { name: /Delete/ })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(app).toBeFocused();
  await app.locator('> div').click({ button: 'right' });
  await expect(page.getByRole('menu')).toBeVisible();
  await page.getByRole('menuitem', { name: /Duplicate/ }).click();
  await expect(item(page, /^App-copy\.tsx/)).toBeVisible();
});

test('drag moves a file into a folder, and Move to… does the same from the keyboard', async ({ page }) => {
  await openStudio(page);
  await item(page, /^App\.tsx/).focus();
  await page.keyboard.press('Alt+Shift+N');
  await page.keyboard.press('Enter'); // components/Component.tsx
  await item(page, /^App\.tsx/).focus();
  await page.keyboard.press('Alt+N');
  await page.keyboard.type('Card');
  await page.keyboard.press('Enter');
  await item(page, /^Card\.tsx/).locator('> div').dragTo(item(page, /^components/).locator('> div').first());
  await expect(page.getByText('Moved Card.tsx to src/components.').first()).toBeVisible();

  await item(page, /^Card\.tsx/).focus();
  await page.keyboard.press('Shift+F10');
  await page.getByRole('menuitem', { name: /Move to/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Move Card.tsx' });
  await dialog.getByRole('treeitem', { name: /^src/ }).locator('> div').first().click();
  await dialog.getByRole('button', { name: 'Move' }).click();
  await expect(page.getByText('Moved Card.tsx to src.').first()).toBeVisible();
});

test('folder delete asks for confirmation with Cancel focused', async ({ page }) => {
  await openStudio(page);
  await item(page, /^App\.tsx/).focus();
  await page.keyboard.press('Alt+Shift+N');
  await page.keyboard.press('Enter');
  await item(page, /^components/).focus();
  await page.keyboard.press('Delete');
  const dialog = page.getByRole('alertdialog', { name: 'Delete folder components?' });
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Delete' }).click();
  await expect(item(page, /^components/)).toHaveCount(0);
});

for (const theme of THEMES) {
  test(`Files tree has no axe violations and a visible focus ring (${theme})`, async ({ page }) => {
    await openStudio(page, theme);
    await item(page, /^App\.tsx/).focus();
    const outline = await item(page, /^App\.tsx/).evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
    const results = await new AxeBuilder({ page } as unknown as ConstructorParameters<typeof AxeBuilder>[0]).include('[aria-label="Project files"]').analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
  });
}
