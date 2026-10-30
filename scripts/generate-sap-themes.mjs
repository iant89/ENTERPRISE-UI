// Generates src/themes/sap-*.css from SAP's open-source theming base content (Apache-2.0).
//   npm pack @sap-theming/theming-base-content@11.36.5 && tar xzf sap-theming-theming-base-content-*.tgz
//   node scripts/generate-sap-themes.mjs ./package
// The output is committed; the package is not a dependency.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
if (!root) { console.error('usage: node scripts/generate-sap-themes.mjs <extracted theming-base-content package dir>'); process.exit(1); }
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;

const themes = [
  { id: 'sap-horizon', sap: 'sap_horizon', label: 'Morning Horizon', scheme: 'light' },
  { id: 'sap-horizon-dark', sap: 'sap_horizon_dark', label: 'Evening Horizon', scheme: 'dark' },
  { id: 'sap-fiori-3', sap: 'sap_fiori_3', label: 'Quartz Light', scheme: 'light' },
  { id: 'sap-fiori-3-dark', sap: 'sap_fiori_3_dark', label: 'Quartz Dark', scheme: 'dark' },
];

const hex = (c) => {
  c = c.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(c)) return '#' + [...c.slice(1)].map((x) => x + x).join('');
  if (/^#[0-9a-f]{6}$/.test(c)) return c;
  return null;
};
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => { const [r, g, b] = rgb(h).map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
/** Picks the first candidate meeting `min` contrast on `bg`, else the best one. */
const readable = (bg, min, ...candidates) => {
  const list = candidates.filter(Boolean);
  return list.find((c) => ratio(c, bg) >= min) ?? list.sort((a, b) => ratio(b, bg) - ratio(a, bg))[0];
};
/** Moves a colour towards black (light themes) or white (dark themes) until it reaches `min` on `bg`. */
const ensure = (fg, bg, min, dark) => {
  dark = lum(bg) < 0.18 ? true : lum(bg) > 0.5 ? false : dark;
  let c = fg;
  for (let i = 0; i < 40 && ratio(c, bg) < min; i++) {
    c = '#' + rgb(c).map((v) => Math.round(dark ? v + (255 - v) * 0.08 : v * 0.92).toString(16).padStart(2, '0')).join('');
  }
  return c;
};

const adjusted = [];
for (const t of themes) {
  const css = readFileSync(join(root, 'content/Base/baseLib', t.sap, 'css_variables.css'), 'utf8');
  const p = Object.fromEntries([...css.matchAll(/--(sap[\w]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const get = (k) => { if (!(k in p)) throw new Error(`${t.sap}: missing ${k}`); return p[k]; };
  const c = (k) => { const v = hex(get(k)); if (!v) throw new Error(`${t.sap}: ${k} is not a hex colour (${get(k)})`); return v; };
  const dark = t.scheme === 'dark';
  const surface = c('sapGroup_ContentBackground');
  const background = c('sapBackgroundColor');
  const fix = (name, fg, bg, min) => { const v = ensure(fg, bg, min, dark); if (v !== fg) adjusted.push(`${t.id}: ${name} ${fg} → ${v} (WCAG ${min}:1)`); return v; };

  const v = {};
  // Brand
  // Primary doubles as the text colour of secondary/tertiary buttons, so it must reach 4.5:1 on surfaces and 3:1 on selected rows.
  const primary = fix('primary', fix('primary', c('sapButton_Emphasized_Background'), surface, 4.5), c('sapList_SelectionBackgroundColor'), 3);
  v['color-primary'] = primary;
  v['color-on-primary'] = readable(primary, 4.5, c('sapButton_Emphasized_TextColor'), c('sapContent_ContrastTextColor'), '#ffffff', '#000000');
  const hover = c('sapButton_Emphasized_Hover_Background');
  v['color-primary-hover'] = ratio(v['color-on-primary'], hover) >= 4.5 ? hover : fix('primary-hover', hover, v['color-on-primary'], 4.5);
  v['color-primary-active'] = v['color-primary-hover'];
  v['color-primary-subtle'] = c('sapList_SelectionBackgroundColor');
  v['color-primary-subtle-hover'] = c('sapList_Hover_SelectionBackground');
  v['color-selected-text'] = fix('selected-text', c('sapSelectedColor'), c('sapList_Hover_SelectionBackground'), 4.5);
  v['color-link'] = fix('link', c('sapLinkColor'), surface, 4.5);
  v['color-link-hover'] = c('sapLink_Hover_Color');
  // Surfaces
  v['color-background'] = background;
  v['color-surface'] = surface;
  v['color-surface-alt'] = c('sapList_HeaderBackground');
  v['color-surface-sunken'] = c('sapField_ReadOnly_Background');
  v['color-surface-hover'] = c('sapList_Hover_Background');
  v['color-surface-active'] = dark ? c('sapList_Hover_SelectionBackground') : c('sapField_ReadOnly_Background');
  v['color-surface-selected'] = c('sapList_SelectionBackgroundColor');
  v['color-surface-selected-hover'] = c('sapList_Hover_SelectionBackground');
  v['color-overlay'] = `rgba(0, 0, 0, ${Number(get('sapBlockLayer_Opacity'))})`;
  // The library header uses theme text colours, so the shell follows the base colour (Quartz's dark shell bar is a documented gap).
  v['color-shell'] = c('sapBaseColor');
  v['color-shell-border'] = c('sapList_BorderColor');
  v['color-tooltip'] = c('sapTextColor');
  v['color-on-tooltip'] = c('sapBaseColor');
  // Borders
  v['color-border'] = c('sapList_BorderColor');
  v['color-border-subtle'] = c('sapList_BorderColor');
  v['color-border-strong'] = fix('border-strong', c('sapField_BorderColor'), surface, 3);
  v['color-border-hover'] = c('sapField_Hover_BorderColor');
  // Text
  v['color-text'] = c('sapTextColor');
  v['color-text-secondary'] = fix('text-secondary', c('sapContent_LabelColor'), c('sapList_Hover_Background'), 4.5);
  v['color-text-placeholder'] = fix('text-placeholder', c('sapField_PlaceholderTextColor'), surface, 4.5);
  v['color-text-inverse'] = c('sapContent_ContrastTextColor');
  v['color-icon'] = fix('icon', c('sapContent_IconColor'), surface, 3);
  // Semantic
  const sem = (name, solid, text, subtle, border) => {
    v[`color-${name}`] = c(solid);
    v[`color-${name}-text`] = fix(`${name}-text`, c(text), c(subtle), 4.5);
    v[`color-${name}-subtle`] = c(subtle);
    v[`color-${name}-border`] = c(border);
  };
  sem('success', 'sapPositiveColor', 'sapPositiveTextColor', 'sapSuccessBackground', 'sapSuccessBorderColor');
  sem('warning', 'sapCriticalColor', 'sapCriticalTextColor', 'sapWarningBackground', 'sapWarningBorderColor');
  sem('error', 'sapNegativeColor', 'sapNegativeTextColor', 'sapErrorBackground', 'sapErrorBorderColor');
  sem('info', 'sapInformativeColor', 'sapInformativeTextColor', 'sapInformationBackground', 'sapInformationBorderColor');
  sem('neutral', 'sapNeutralColor', 'sapNeutralTextColor', 'sapNeutralBackground', 'sapNeutralBorderColor');
  v['color-error-hover'] = c('sapButton_Negative_Hover_Background');
  v['color-on-success'] = readable(v['color-success'], 4.5, c('sapButton_Success_TextColor'), '#ffffff', '#000000');
  v['color-on-warning'] = readable(v['color-warning'], 4.5, '#000000', '#ffffff');
  v['color-on-error'] = readable(v['color-error'], 4.5, c('sapButton_Negative_TextColor'), '#ffffff', '#000000');
  // Focus
  v['color-focus'] = c('sapContent_FocusColor');
  // Accents
  for (let n = 1; n <= 8; n++) v[`color-accent-${n}`] = fix(`accent-${n}`, c(`sapAccentColor${n}`), surface, 3);
  // Elevation: SAP content shadow levels 0–3 (Shadow Concept) and interaction shadows.
  v['shadow-sm'] = get('sapContent_Shadow0');
  v['shadow-md'] = get('sapContent_Shadow1');
  v['shadow-lg'] = get('sapContent_Shadow2');
  v['shadow-xl'] = get('sapContent_Shadow3');
  v['shadow-header'] = get('sapContent_HeaderShadow');
  for (let n = 0; n <= 3; n++) v[`shadow-level-${n}`] = get(`sapContent_Shadow${n}`);
  v['shadow-interaction'] = get('sapContent_Interaction_Shadow');
  v['shadow-selected'] = get('sapContent_Selected_Shadow');
  v['shadow-negative'] = get('sapContent_Negative_Shadow');
  v['shadow-critical'] = get('sapContent_Critical_Shadow');
  v['shadow-positive'] = get('sapContent_Positive_Shadow');
  v['shadow-informative'] = get('sapContent_Informative_Shadow');
  v['shadow-text'] = get('sapContent_TextShadow');
  // Shape and type
  v['radius-sm'] = get('sapField_BorderCornerRadius');
  v['radius-md'] = get('sapButton_BorderCornerRadius');
  v['radius-lg'] = get('sapElement_BorderCornerRadius');
  v['font-family'] = get('sapFontFamily');

  const body = Object.entries(v).map(([k, val]) => `  --eui-${k}: ${val};`).join('\n');
  writeFileSync(new URL(`../src/themes/${t.id}.css`, import.meta.url),
`/* ${t.label} (${t.sap}) — generated by scripts/generate-sap-themes.mjs from
 * @sap-theming/theming-base-content ${version} (Apache-2.0, © SAP SE or an SAP affiliate company).
 * See src/themes/SAP-THEMES.md. Do not edit by hand; re-run the generator. */
[data-eui-theme='${t.id}'] {
  color-scheme: ${t.scheme};

${body}
}
`);
}
console.log(`Generated ${themes.length} SAP themes from theming-base-content ${version}.`);
if (adjusted.length) console.log('Contrast adjustments:\n  ' + adjusted.join('\n  '));
