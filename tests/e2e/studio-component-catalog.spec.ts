import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Code Studio C6: component catalog (Chromium, desktop). */
test.skip(({ isMobile }) => !!isMobile, 'Desktop layout');

async function openCode(page: Page) {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('eui-c6-e2e')) {
      sessionStorage.setItem('eui-c6-e2e', '1');
      indexedDB.deleteDatabase('eui-studio');
      localStorage.clear();
    }
  });
  await page.goto('/studio/');
  await page.getByRole('radio', { name: 'Code Studio' }).click();
  await expect(files(page).getByRole('treeitem', { name: 'App.tsx', exact: true })).toBeVisible();
}
const files = (page: Page) => page.getByRole('tree', { name: 'Project files' });
const panel = (page: Page) => page.getByTestId('components-panel');
const projectList = (page: Page) => panel(page).getByRole('listbox', { name: 'Project components' });
const option = (page: Page, name: string) => projectList(page).getByRole('option', { name: new RegExp(`^${name}\\b`) });
const editorLines = (page: Page) => page.locator('[data-testid="code-editor"][data-group="0"] .view-lines');
const activity = (page: Page, name: string) => page.getByRole('tab', { name, exact: true }).click();

async function create(page: Page, name: string, docs = true) {
  await activity(page, 'Components');
  await panel(page).getByRole('button', { name: 'Create component' }).click();
  const d = page.getByRole('dialog', { name: 'Create component' });
  await d.getByRole('textbox', { name: /Component name/ }).fill(name);
  if (!docs) await d.getByRole('checkbox', { name: /Documentation/ }).uncheck();
  await d.getByRole('button', { name: /^Create \d files$/ }).click();
  await expect(d).toBeHidden();
}
async function replaceText(page: Page, text: string) {
  await editorLines(page).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(text);
}

test('generated components appear with docs badges, props update, cross-file props resolve, filter works', async ({ page }) => {
  await openCode(page);
  await create(page, 'ExampleCard');
  await create(page, 'Bare', false);
  await activity(page, 'Components');
  await expect(option(page, 'ExampleCard')).toBeVisible();
  await expect(option(page, 'ExampleCard').getByText('No docs')).toHaveCount(0);
  await expect(option(page, 'Bare').getByText('No docs')).toBeVisible();
  await expect(option(page, 'ExampleCard').getByTestId('catalog-signature')).toContainText('title: string · children?: ReactNode · emphasized?: boolean = false');

  // Props in a separate file, imported: resolves once the TS pass runs.
  await page.getByRole('button', { name: 'Bare.tsx', exact: true }).click();
  await replaceText(page, "import type { BareProps } from './props';\nexport function Bare({ heading, dense = true }: BareProps) {\n  return <h2>{heading}</h2>;\n}\n");
  await activity(page, 'Explorer');
  await files(page).getByRole('treeitem', { name: /^Bare\.tsx/ }).focus();
  await page.keyboard.press('Alt+N');
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('props.ts');
  await page.keyboard.press('Enter');
  await replaceText(page, 'export interface BareProps {\n  /** Main heading. */\n  heading: string;\n  dense?: boolean;\n}\n');
  await activity(page, 'Components');
  await expect(option(page, 'Bare').getByTestId('catalog-signature')).toContainText('heading: string · dense?: boolean = true');

  await panel(page).getByRole('textbox', { name: 'Filter by name or prop' }).fill('emphas');
  await expect(option(page, 'ExampleCard')).toBeVisible();
  await expect(option(page, 'Bare')).toHaveCount(0);
  await panel(page).getByRole('textbox', { name: 'Filter by name or prop' }).fill('');

  const axe = await new AxeBuilder({ page: page as never }).include('[data-testid="components-panel"]').analyze();
  expect(axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
});

test('Insert adds snippet + import as one undo step; Source opens the file; Docs opens; library expands', async ({ page }) => {
  await openCode(page);
  await create(page, 'ExampleCard');
  await page.getByRole('button', { name: 'App.tsx', exact: true }).click();
  await replaceText(page, "export default function App() {\n  return <main>\n  </main>;\n}\n");
  await page.keyboard.press('ControlOrMeta+Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('End');
  await activity(page, 'Components');
  await option(page, 'ExampleCard').click();
  await panel(page).getByRole('toolbar', { name: 'Actions for ExampleCard' }).getByRole('button', { name: 'Insert' }).click();
  await expect(editorLines(page)).toContainText("import { ExampleCard } from './components/ExampleCard';");
  await expect(page.frameLocator('iframe[title="Page preview"]').getByRole('heading', { name: 'Title' })).toBeVisible();
  await page.getByRole('button', { name: /^Undo/ }).first().click();
  await expect(editorLines(page)).not.toContainText('ExampleCard');

  await option(page, 'ExampleCard').click();
  await panel(page).getByRole('toolbar', { name: 'Actions for ExampleCard' }).getByRole('button', { name: 'Source' }).click();
  await expect(page.getByRole('button', { name: 'ExampleCard.tsx', exact: true })).toHaveAttribute('aria-current', 'true');

  await activity(page, 'Components');
  await projectList(page).focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('docs-page-title')).toHaveText('ExampleCard');

  await activity(page, 'Components');
  const lib = panel(page).getByRole('button', { name: 'Enterprise UI library' });
  await expect(lib).toHaveAttribute('aria-expanded', 'false');
  await lib.click();
  const libList = panel(page).getByRole('listbox', { name: 'Library components' });
  await expect(libList.getByRole('option', { name: /^Button\b/ })).toBeVisible();
  await expect(libList.getByRole('group').first()).toBeVisible();
  await lib.click();
  await expect(libList).toHaveCount(0);
});
