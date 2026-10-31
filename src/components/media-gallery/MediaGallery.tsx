import { forwardRef, useRef, type HTMLAttributes, type KeyboardEvent } from 'react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import styles from './MediaGallery.module.css';

export interface MediaGalleryItem {
  id: string;
  src: string;
  /** Required text alternative. */
  alt: string;
  /** Smaller thumbnail image. Defaults to `src`. */
  thumbnailSrc?: string;
  disabled?: boolean;
}

export interface MediaGalleryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Items shown in the media gallery. */
  items: MediaGalleryItem[];
  /** ID of the selected item. Providing it makes the selection controlled. */
  selectedId?: string;
  /** Initial `selectedId` when it is uncontrolled. */
  defaultSelectedId?: string;
  /** Called with the new selection when the user changes it. */
  onSelectionChange?: (id: string) => void;
  /** Accessible name for the gallery. */
  'aria-label': string;
  /** Thumbnail strip position. @default 'bottom' */
  menuPosition?: 'bottom' | 'start';
  /** Called when the displayed image is activated (for example to open full screen). */
  onDisplayAreaClick?: (item: MediaGalleryItem) => void;
}

/** A selected image with a keyboard-navigable thumbnail strip. */
export const MediaGallery = forwardRef<HTMLDivElement, MediaGalleryProps>(function MediaGallery(
  { items, selectedId, defaultSelectedId, onSelectionChange, menuPosition = 'bottom', onDisplayAreaClick, className, 'aria-label': label, ...rest },
  ref,
) {
  const [selected, setSelected] = useControllableState(selectedId, defaultSelectedId ?? items[0]?.id ?? '', onSelectionChange);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = items.find((i) => i.id === selected) ?? items[0];
  const onKey = (event: KeyboardEvent, index: number) => {
    const forward = menuPosition === 'start' ? 'ArrowDown' : 'ArrowRight';
    const back = menuPosition === 'start' ? 'ArrowUp' : 'ArrowLeft';
    let next = -1;
    if (event.key === forward) next = Math.min(items.length - 1, index + 1);
    else if (event.key === back) next = Math.max(0, index - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    if (next < 0) return;
    event.preventDefault();
    thumbs.current[next]?.focus();
  };
  return (
    <div ref={ref} role="group" aria-label={label} className={cx(styles.root, menuPosition === 'start' && styles.start, className)} {...rest}>
      <div className={styles.display}>
        {current && (onDisplayAreaClick ? (
          <button type="button" className={styles.displayButton} onClick={() => onDisplayAreaClick(current)}><img src={current.src} alt={current.alt} className={styles.image} /></button>
        ) : <img src={current.src} alt={current.alt} className={styles.image} />)}
      </div>
      <ul className={styles.thumbs}>
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              ref={(el) => { thumbs.current[index] = el; }}
              type="button"
              className={cx(styles.thumb, item.id === current?.id && styles.selected)}
              aria-pressed={item.id === current?.id}
              disabled={item.disabled}
              onClick={() => setSelected(item.id)}
              onKeyDown={(e) => onKey(e, index)}
            >
              <img src={item.thumbnailSrc ?? item.src} alt={item.alt} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});
