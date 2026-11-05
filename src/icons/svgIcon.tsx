import type { ReactElement, Ref, SVGProps } from 'react';
import { cx } from '../utilities/cx';
import { svgIconProvider } from './providers/providers';
import { definitionFromSvg } from './collections/enterprise/definitionFromSvg';
import type { IconDefinition } from './core/types';
import { toUri } from './core/identifier';

/** Props of the internal `svgIcon` helper. */
export interface SvgIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref' | 'children'> {
  /** Width and height. CSS that sizes the `svg` (for example inside a Button) takes precedence. @default 24 */
  size?: number | string;
  /** Fill colour. @default 'currentColor' */
  color?: string;
  /** Tooltip and accessible name. */
  title?: string;
  ref?: Ref<SVGSVGElement>;
}

const definitions = new Map<string, IconDefinition>();

/**
 * Internal: draws one icon from a directly imported SVG file through the SVG provider, without the
 * registry. Library components use it for their built-in icons (chevrons, close buttons…), so apps
 * only bundle the icons those components actually use:
 * `import barCode from '../../assets/icons/bar-code.svg?raw'` → `svgIcon(barCode, 'bar-code')`.
 */
export function svgIcon(svg: string, name: string, props: SvgIconProps = {}): ReactElement {
  let definition = definitions.get(name);
  if (!definition) {
    const input = definitionFromSvg(name, svg);
    definition = { collection: 'enterprise', name, uri: toUri('enterprise', name), provider: 'svg', source: input.source as IconDefinition['source'], aliases: [], metadata: input.metadata ?? {} };
    definitions.set(name, definition);
  }
  const { size = 24, color, title, className, ref, style, ...rest } = props;
  const labelled = Boolean(title || rest['aria-label'] || rest['aria-labelledby']);
  return svgIconProvider.render(definition, {
    className: cx(className),
    size,
    style: color ? { ...style, color } : style,
    accessibility: labelled ? { role: 'img' } : { 'aria-hidden': true },
    title,
    attributes: rest,
    ref: ref as Ref<Element>,
  });
}
