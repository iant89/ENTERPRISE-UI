/** Responsive breakpoints in px (min-width of the next size class). */
export const breakpoints = { sm: 600, md: 1024, lg: 1440 } as const;

export interface TokenDefinition {
  name: string;
  description: string;
}

export interface TokenGroup {
  id: string;
  title: string;
  description: string;
  kind: 'color' | 'space' | 'radius' | 'shadow' | 'font-size' | 'font-weight' | 'size' | 'duration' | 'z-index' | 'other';
  tokens: TokenDefinition[];
}

const t = (name: string, description = ''): TokenDefinition => ({ name: `--eui-${name}`, description });

/**
 * Catalogue of the design tokens. Values are defined in CSS
 * (`tokens/tokens.css`, `themes/*.css`) and read at runtime via
 * {@link getTokenValue} so they always reflect the active theme.
 */
export const tokenGroups: TokenGroup[] = [
  {
    id: 'brand', title: 'Brand & interaction', kind: 'color',
    description: 'Primary actions, selection indicators, links and focus.',
    tokens: [
      t('color-primary', 'Primary actions and selection'), t('color-primary-hover', 'Hover state of primary actions'),
      t('color-primary-active', 'Pressed state'), t('color-on-primary', 'Text on primary'),
      t('color-primary-subtle', 'Selected / emphasized backgrounds'), t('color-selected-text', 'Brand text on selected backgrounds'),
      t('color-link', 'Hyperlinks'), t('color-focus', 'Focus indicator'),
    ],
  },
  {
    id: 'surface', title: 'Surfaces', kind: 'color',
    description: 'Application background and component surfaces.',
    tokens: [
      t('color-background', 'Application background'), t('color-surface', 'Component surfaces'),
      t('color-surface-alt', 'Headers and secondary areas'), t('color-surface-sunken', 'Inset areas'),
      t('color-surface-hover', 'Hovered rows and items'), t('color-surface-active', 'Pressed items'),
      t('color-surface-selected', 'Selected rows and items'), t('color-shell', 'Application header'),
    ],
  },
  {
    id: 'text', title: 'Text & borders', kind: 'color',
    description: 'Foreground colors and separators.',
    tokens: [
      t('color-text', 'Primary text'), t('color-text-secondary', 'Secondary text, labels'),
      t('color-text-placeholder', 'Placeholders'), t('color-icon', 'Default icon color'),
      t('color-border', 'Neutral borders and dividers'), t('color-border-subtle', 'Low-emphasis dividers'),
      t('color-border-strong', 'Input borders (3:1 contrast)'),
    ],
  },
  {
    id: 'semantic', title: 'Semantic', kind: 'color',
    description: 'Status colors. Each has -text, -subtle and -border variants.',
    tokens: [
      t('color-success', 'Positive'), t('color-success-subtle'), t('color-warning', 'Critical'), t('color-warning-subtle'),
      t('color-error', 'Negative'), t('color-error-subtle'), t('color-info', 'Information'), t('color-info-subtle'),
      t('color-neutral', 'Neutral'), t('color-neutral-subtle'),
    ],
  },
  {
    id: 'accent', title: 'Accent palette', kind: 'color',
    description: 'Categorical colors for avatars, charts and tags.',
    tokens: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => t(`color-accent-${n}`)),
  },
  {
    id: 'space', title: 'Spacing', kind: 'space',
    description: '4px-based spacing scale used for padding, gaps and margins.',
    tokens: ['0-5', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16'].map((n) => t(`space-${n}`)),
  },
  {
    id: 'font-size', title: 'Font sizes', kind: 'font-size',
    description: '14px base with a restrained scale for dense business UI.',
    tokens: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].map((n) => t(`font-size-${n}`)),
  },
  {
    id: 'font-weight', title: 'Font weights', kind: 'font-weight',
    description: 'Weights of the 72 / Segoe UI stack.',
    tokens: ['regular', 'medium', 'semibold', 'bold'].map((n) => t(`font-weight-${n}`)),
  },
  {
    id: 'radius', title: 'Radii', kind: 'radius', description: 'Small, restrained corner radii.',
    tokens: ['xs', 'sm', 'md', 'lg', 'full'].map((n) => t(`radius-${n}`)),
  },
  {
    id: 'shadow', title: 'Shadows', kind: 'shadow', description: 'Subtle elevation levels.',
    tokens: [t('shadow-sm', 'Cards'), t('shadow-md', 'Raised cards, menus'), t('shadow-lg', 'Popovers'), t('shadow-xl', 'Dialogs')],
  },
  {
    id: 'size', title: 'Component sizes', kind: 'size',
    description: 'Heights adapt to the density setting (cozy / compact).',
    tokens: [
      t('control-height-sm'), t('control-height', 'Buttons, inputs'), t('control-height-lg'), t('row-height', 'Table rows'),
      t('header-height', 'Application header'), t('sidenav-width'), t('sidenav-width-collapsed'), t('focus-width', 'Focus outline width'),
      t('focus-offset', 'Focus outline offset'),
    ],
  },
  {
    id: 'z', title: 'Z-index layers', kind: 'z-index', description: 'Stacking order for layered UI.',
    tokens: ['sticky', 'header', 'drawer', 'dropdown', 'overlay', 'modal', 'popover', 'toast', 'tooltip'].map((n) => t(`z-${n}`)),
  },
  {
    id: 'motion', title: 'Motion', kind: 'duration',
    description: 'Durations collapse to 0ms when reduced motion is requested.',
    tokens: [t('duration-fast'), t('duration-normal'), t('duration-slow'), t('easing-standard'), t('easing-emphasized')],
  },
  {
    id: 'other', title: 'Breakpoints & states', kind: 'other', description: 'Responsive breakpoints and disabled state.',
    tokens: [t('breakpoint-sm'), t('breakpoint-md'), t('breakpoint-lg'), t('disabled-opacity')],
  },
];

/** Reads the computed value of a token on `element` (defaults to `document.documentElement`). */
export function getTokenValue(name: string, element?: Element | null): string {
  if (typeof window === 'undefined') return '';
  const target = element ?? document.documentElement;
  return getComputedStyle(target).getPropertyValue(name.startsWith('--') ? name : `--eui-${name}`).trim();
}
