import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes } from 'react';
import { space, type Space } from '../space';

export interface FlexProps extends HTMLAttributes<HTMLElement> {
  /** @default 'row' */
  /** Direction in which children are laid out. */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  /** @default 'stretch' */
  /** Cross-axis alignment of the children. */
  align?: CSSProperties['alignItems'];
  /** @default 'flex-start' */
  /** Main-axis distribution of the children. */
  justify?: CSSProperties['justifyContent'];
  /** @default 'nowrap' */
  /** Whether children wrap onto new lines when they do not fit. */
  wrap?: CSSProperties['flexWrap'] | boolean;
  /** Gap on the spacing scale. @default 0 */
  gap?: Space;
  /** Render as `inline-flex`. @default false */
  inline?: boolean;
  /** @default 'div' */
  /** HTML element rendered as the root. */
  as?: ElementType;
}

/** Flexbox layout primitive with token-based gaps. */
export const Flex = forwardRef<HTMLElement, FlexProps>(function Flex(
  { direction = 'row', align, justify, wrap = 'nowrap', gap = 0, inline = false, as: As = 'div', style, ...rest },
  ref,
) {
  return (
    <As
      ref={ref}
      style={{
        display: inline ? 'inline-flex' : 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap === true ? 'wrap' : wrap === false ? 'nowrap' : wrap,
        gap: space(gap),
        minWidth: 0,
        ...style,
      }}
      {...rest}
    />
  );
});
