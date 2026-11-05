import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type ImgHTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import { Portal } from '../../utilities/Portal';
import { useId } from '../../hooks/useId';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useControllableState } from '../../hooks/useControllableState';
import { Button } from '../button';
import { BusyIndicator } from '../busy-indicator';
import { EmptyState } from '../../patterns/empty-state';
import styles from './Lightbox.module.css';
import pictureSvg from '../../assets/icons/picture.svg?raw';
import zoomInSvg from '../../assets/icons/zoom-in.svg?raw';
import { svgIcon } from '../../icons/svgIcon';

export interface LightboxLabels {
  /** Close button text. */
  close: string;
  /** Busy indicator text while the image loads. */
  loading: string;
  /** Error title when the image cannot be shown. */
  errorTitle: string;
  /** Error description when the image cannot be shown. */
  errorDescription: string;
  /** Accessible name of the thumbnail trigger (LightboxImage). */
  open: (title: string) => string;
}

const defaultLabels: LightboxLabels = {
  close: 'Close',
  loading: 'Loading image',
  errorTitle: 'Image could not be loaded',
  errorDescription: 'The file may be missing, or the connection to the server was lost. Try again later.',
  open: (title) => `Enlarge image: ${title}`,
};

export interface LightboxProps {
  /** Whether the lightbox is shown. */
  open: boolean;
  /** Called when the lightbox asks to close (Close button, Escape, click outside the container). */
  onClose: () => void;
  /** URL of the original image. Required: without it the lightbox never opens. */
  src: string;
  /** Text alternative for the image. Defaults to the title. */
  alt?: string;
  /** Describes the object the image belongs to. Also the lightbox's accessible name. */
  title: string;
  /** Additional information about the object. */
  subtitle?: string;
  /** Time before the busy indicator appears, in milliseconds. @default 1000 */
  busyDelay?: number;
  /** Time after which a still-loading image is shown as an error, in milliseconds. @default 10000 */
  loadTimeout?: number;
  /** Text overrides. */
  labels?: Partial<LightboxLabels>;
  /** Additional CSS class names for the lightbox container. */
  className?: string;
}

type LoadState = 'loading' | 'loaded' | 'error';

/**
 * Shows an image at its original size in a popup and dims the rest of the screen (Fiori lightbox).
 * Images larger than the screen are scaled down proportionally to fit; smaller images are never enlarged.
 */
export function Lightbox({ open, onClose, src, alt, title, subtitle, busyDelay = 1000, loadTimeout = 10000, labels, className }: LightboxProps) {
  const text = { ...defaultLabels, ...labels };
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId(undefined, 'lightbox-title');
  const pointerDownOutside = useRef(false);
  const active = open && !!src;
  const [state, setState] = useState<LoadState>('loading');
  useFocusTrap(containerRef, active);
  useScrollLock(active);

  useEffect(() => {
    if (!active) return;
    setState('loading');
    const timer = setTimeout(() => setState((s) => (s === 'loading' ? 'error' : s)), loadTimeout);
    return () => clearTimeout(timer);
  }, [active, src, loadTimeout]);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!active) return;
    // Listen on the document so Escape works before focus has moved into the lightbox.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        closeRef.current();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);

  if (!active) return null;

  return (
    <Portal>
      <div
        className={styles.overlay}
        onPointerDown={(event) => { pointerDownOutside.current = event.target === event.currentTarget; }}
        onClick={(event) => { if (pointerDownOutside.current && event.target === event.currentTarget) onClose(); }}
      >
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={cx(styles.container, state !== 'loaded' && styles.pending, className)}
        >
          <div className={styles.media} aria-busy={state === 'loading' || undefined}>
            {state !== 'error' && (
              <img
                key={src}
                src={src}
                alt={alt ?? title}
                className={cx(styles.image, state !== 'loaded' && styles.hidden)}
                onLoad={() => setState('loaded')}
                onError={() => setState('error')}
              />
            )}
            {state === 'loading' && <BusyIndicator active delay={busyDelay} text={text.loading} className={styles.busy} />}
            {state === 'error' && (
              <EmptyState size="sm" icon={svgIcon(pictureSvg, 'picture')} title={text.errorTitle} description={text.errorDescription} headingLevel={3} className={styles.error} />
            )}
          </div>
          <div className={styles.footer}>
            <div className={styles.text}>
              <h2 id={titleId} className={styles.title}>{title}</h2>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            <Button variant="tertiary" onClick={onClose}>{text.close}</Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export interface LightboxImageProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title' | 'children' | 'onClick'>,
    Pick<LightboxProps, 'src' | 'title' | 'subtitle' | 'busyDelay' | 'loadTimeout' | 'labels'> {
  /** Thumbnail URL. @default src */
  thumbnailSrc?: string;
  /** Text alternative for the image. Defaults to the title. */
  alt?: string;
  /** Thumbnail width in CSS pixels. */
  width?: number;
  /** Thumbnail height in CSS pixels. */
  height?: number;
  /** Whether the lightbox is open (controlled). */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the lightbox opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Extra attributes for the thumbnail `img`. */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'>;
}

/**
 * A thumbnail that opens the Lightbox when pressed. A zoom icon at the bottom right marks it as enlargeable.
 * Without `src` it renders a plain image and no lightbox can open.
 */
export const LightboxImage = forwardRef<HTMLButtonElement, LightboxImageProps>(function LightboxImage(
  { src, thumbnailSrc, alt, title, subtitle, width, height, open, defaultOpen = false, onOpenChange, busyDelay, loadTimeout, labels, imgProps, className, ...rest },
  ref,
) {
  const text = { ...defaultLabels, ...labels };
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const thumbnail = <img {...imgProps} src={thumbnailSrc ?? src} alt={alt ?? title} width={width} height={height} className={cx(styles.thumbImage, imgProps?.className)} />;
  if (!src) return <span className={cx(styles.thumb, styles.static, className)}>{thumbnail}</span>;
  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        aria-label={text.open(title)}
        className={cx(styles.thumb, className)}
        onClick={() => setOpen(true)}
        {...rest}
      >
        {thumbnail}
        <span className={styles.zoom} aria-hidden="true">{svgIcon(zoomInSvg, 'zoom-in')}</span>
      </button>
      <Lightbox open={isOpen} onClose={() => setOpen(false)} src={src} alt={alt} title={title} subtitle={subtitle} busyDelay={busyDelay} loadTimeout={loadTimeout} labels={labels} />
    </>
  );
});
