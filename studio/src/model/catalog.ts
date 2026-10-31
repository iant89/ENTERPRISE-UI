import api from '../../../docs/generated/api.json';
import { docs, categories, type Category } from '../../../docs/src/registry';
import type { PropMeta } from './inspector';

export interface CatalogEntry {
  name: string;
  category: Category;
  summary: string;
  snippet: string;
  /** Accepts JSX children, so drops go inside it. */
  container: boolean;
}

type ApiComponent = { name: string; description?: string; props: PropMeta[] };
const components = (api as unknown as { components: Record<string, ApiComponent> }).components;

/** Curated starting markup for frequently used components. */
const SNIPPETS: Record<string, string> = {
  Button: '<Button>Button</Button>',
  Input: '<Input label="Label" />',
  TextArea: '<TextArea label="Notes" />',
  NumberInput: '<NumberInput label="Quantity" />',
  Select: '<Select label="Status" options={[{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }]} />',
  Checkbox: '<Checkbox label="Accept terms" />',
  Switch: '<Switch label="Notifications" />',
  DatePicker: '<DatePicker label="Due date" />',
  SearchField: '<SearchField aria-label="Search" />',
  Title: '<Title level={2}>Title</Title>',
  Text: '<Text>Text</Text>',
  Link: '<Link href="#">Link</Link>',
  Badge: '<Badge>New</Badge>',
  Card: '<Card>\n  <Text>Card content</Text>\n</Card>',
  Panel: '<Panel title="Panel">\n  <Text>Panel content</Text>\n</Panel>',
  MessageStrip: '<MessageStrip tone="information">Message</MessageStrip>',
  Stack: '<Stack gap={3}>\n</Stack>',
  Flex: '<Flex gap={2}>\n</Flex>',
  Bar: '<Bar startContent={<Title level={3}>Bar</Title>} />',
  Avatar: '<Avatar name="Ada Lovelace" />',
  EmptyState: '<EmptyState title="No items yet" description="Create an item to get started." />',
  ProgressBar: '<ProgressBar value={40} aria-label="Progress" />',
  Tabs: '<Tabs defaultValue="one">\n  <TabList aria-label="Sections">\n    <Tab value="one">One</Tab>\n    <Tab value="two">Two</Tab>\n  </TabList>\n  <TabPanel value="one">First panel</TabPanel>\n  <TabPanel value="two">Second panel</TabPanel>\n</Tabs>',
};

function placeholder(prop: PropMeta): string | null {
  const type = prop.type.replace(/\s*\|\s*undefined/g, '');
  if (type === 'string' || type === 'ReactNode') return `${prop.name}="${prop.name === 'aria-label' ? 'Label' : prop.name[0].toUpperCase() + prop.name.slice(1)}"`;
  const literal = /^"([^"]+)"/.exec(type);
  if (literal) return `${prop.name}="${literal[1]}"`;
  if (type === 'number') return `${prop.name}={0}`;
  if (type === 'boolean') return prop.name;
  if (type.endsWith('[]')) return `${prop.name}={[]}`;
  if (type.includes('=>')) return `${prop.name}={() => {}}`;
  return null;
}

/** Generic starting markup from the required properties in the API metadata. */
export function defaultSnippet(name: string): string {
  if (SNIPPETS[name]) return SNIPPETS[name];
  const meta = components[name];
  const attrs = (meta?.props ?? []).filter((p) => p.required && p.name !== 'children').map(placeholder).filter(Boolean);
  const open = [name, ...attrs].join(' ');
  return hasContent(name) ? `<${open}>${name}</${name}>` : `<${open} />`;
}

/** Components whose children are a text label; drops land next to them, not inside. */
const TEXT_CONTENT = new Set(['Button', 'Link', 'Badge', 'Title', 'Text', 'Label', 'Tab', 'ToggleButton', 'AIButton', 'MessageStrip', 'Token']);
/** Data-driven components render from properties, not children. */
const DATA_PROPS = /^(label|items|options|nodes|columns|rows|value|src|steps|events|entries)$/;

/** Whether drops go inside this element. */
export function acceptsChildren(name: string): boolean {
  if (!/^[A-Z]/.test(name)) return !/^(input|img|br|hr|meta|link|area|base|col|embed|source|track|wbr|textarea|select|button|a|p|span|h[1-6]|label)$/.test(name);
  if (TEXT_CONTENT.has(name)) return false;
  const props = components[name]?.props ?? [];
  if (props.some((p) => p.name === 'children')) return true;
  if (SNIPPETS[name]) return SNIPPETS[name].includes(`</${name}>`);
  return !props.some((p) => DATA_PROPS.test(p.name));
}

/** Whether a new snippet should be written with children (text content or nested markup). */
const hasContent = (name: string) => TEXT_CONTENT.has(name) || acceptsChildren(name);

export const propsFor = (name: string): PropMeta[] => components[name]?.props ?? [];
export const descriptionFor = (name: string) => components[name]?.description ?? '';

/** Palette entries: the primary component of every documented page, grouped by docs category. */
export const catalog: CatalogEntry[] = docs
  .filter((doc) => doc.category !== 'Patterns' || components[doc.components[0]])
  .map((doc) => doc.components[0])
  .filter((name, i, all) => components[name] && all.indexOf(name) === i)
  .map((name) => {
    const doc = docs.find((d) => d.components[0] === name)!;
    return { name, category: doc.category, summary: doc.summary, snippet: defaultSnippet(name), container: acceptsChildren(name) };
  })
  .sort((a, b) => categories.findIndex((c) => c.id === a.category) - categories.findIndex((c) => c.id === b.category) || a.name.localeCompare(b.name));

export { categories };
