import { forwardRef, useState, type HTMLAttributes } from 'react';
import { Download, ExternalLink, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { IconButton } from '../icon-button';
import styles from './DocumentViewer.module.css';

export type DocumentKind = 'pdf' | 'image' | 'text';

export interface DocumentViewerLabels {
  zoomIn: string;
  zoomOut: string;
  rotate: string;
  download: string;
  openInNewTab: string;
  zoom: (percent: number) => string;
  fallback: string;
  /** Name of the scrollable preview area. */
  preview: (title: string) => string;
}

export interface DocumentViewerProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** File name or document title; names the frame and the region. */
  title: string;
  /** URL of the PDF or image. Not used for `text` with `content`. */
  src?: string;
  /** Plain-text content (logs, CSV, EDI messages). */
  content?: string;
  /** Kind of document. Defaults from the file extension of `src` or `title`. */
  kind?: DocumentKind;
  /** Alternative text for images. Defaults to the title. */
  alt?: string;
  /** Height of the viewing area. @default '32rem' */
  height?: string;
  /** Shows a download link. @default true */
  downloadable?: boolean;
  /** Overrides for the built-in strings. */
  labels?: Partial<DocumentViewerLabels>;
}

const defaultLabels: DocumentViewerLabels = {
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  rotate: 'Rotate',
  download: 'Download',
  openInNewTab: 'Open in new tab',
  zoom: (p) => `${p}%`,
  fallback: 'This browser cannot show the document here.',
  preview: (title) => `Preview of ${title}`,
};

const kindOf = (name = ''): DocumentKind => (/\.pdf($|\?)/i.test(name) ? 'pdf' : /\.(png|jpe?g|gif|webp|svg|avif|bmp)($|\?)/i.test(name) ? 'image' : 'text');

/**
 * Preview an attachment (invoice PDF, delivery-note scan, text file) inline, with zoom and rotate
 * for images, download and open in a new tab. PDFs use the browser's own viewer.
 */
export const DocumentViewer = forwardRef<HTMLElement, DocumentViewerProps>(function DocumentViewer(
  { title, src, content, kind: kindProp, alt, height = '32rem', downloadable = true, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const kind = kindProp ?? (content !== undefined ? 'text' : kindOf(src ?? title));
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  return (
    <section ref={ref} className={cx(styles.viewer, className)} aria-label={title} {...rest}>
      <div className={styles.toolbar}>
        <span className={styles.title} title={title}>
          {title}
        </span>
        {kind === 'image' && (
          <>
            <IconButton icon={<ZoomOut />} label={labels.zoomOut} size="sm" disabled={zoom <= 25} onClick={() => setZoom((z) => Math.max(25, z - 25))} />
            <span className={styles.zoom} aria-live="polite">
              {labels.zoom(zoom)}
            </span>
            <IconButton icon={<ZoomIn />} label={labels.zoomIn} size="sm" disabled={zoom >= 400} onClick={() => setZoom((z) => Math.min(400, z + 25))} />
            <IconButton icon={<RotateCw />} label={labels.rotate} size="sm" onClick={() => setRotation((r) => (r + 90) % 360)} />
          </>
        )}
        {src && (
          <a className={styles.link} href={src} target="_blank" rel="noopener noreferrer" aria-label={labels.openInNewTab} title={labels.openInNewTab}>
            <ExternalLink aria-hidden="true" />
          </a>
        )}
        {src && downloadable && (
          <a className={styles.link} href={src} download aria-label={labels.download} title={labels.download}>
            <Download aria-hidden="true" />
          </a>
        )}
      </div>
      <div className={cx(styles.stage, kind === 'image' && styles.imageStage)} style={{ height }} tabIndex={kind === 'pdf' ? undefined : 0} aria-label={kind === 'pdf' ? undefined : labels.preview(title)} role={kind === 'pdf' ? undefined : 'region'}>
        {kind === 'pdf' && src && (
          <iframe className={styles.frame} src={src} title={title}>
            <p>
              {labels.fallback} <a href={src}>{`${labels.download} ${title}`}</a>
            </p>
          </iframe>
        )}
        {kind === 'image' && src && (
          <img
            className={styles.image}
            src={src}
            alt={alt ?? title}
            style={{ width: `${zoom}%`, transform: rotation ? `rotate(${rotation}deg)` : undefined }}
          />
        )}
        {kind === 'text' && <pre className={styles.text}>{content}</pre>}
      </div>
    </section>
  );
});
