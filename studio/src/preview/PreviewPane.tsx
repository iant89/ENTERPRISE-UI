import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Link, MessageStrip, type Density, type ThemeName } from '@enterprise-ui/react';
import { cx } from '../../../src/utilities/cx';
import { fitScale, VIEWPORTS, type ViewportId } from '../app/workspace/layout';
import { PreviewToolbar } from './PreviewToolbar';
import styles from '../app/workspace/CodeWorkspace.module.css';

export interface StaleInfo { message: string; file: string; line: number | null }

export interface PreviewPaneProps {
  /** The iframe (Canvas). It is always rendered, so a stale state never unmounts it. */
  children: ReactNode;
  theme: ThemeName;
  onTheme: (t: ThemeName) => void;
  density: Density;
  onDensity: (d: Density) => void;
  viewport: ViewportId;
  onViewport: (v: ViewportId) => void;
  paused: boolean;
  onPause: () => void;
  onRefresh: () => void;
  /** Decision 6: set when the last build failed; the last good frame stays visible, dimmed. */
  stale: StaleInfo | null;
  onGoToError: () => void;
  onRetry: () => void;
  compact?: boolean;
}

export function PreviewPane({ children, theme, onTheme, density, onDensity, viewport, onViewport, paused, onPause, onRefresh, stale, onGoToError, onRetry, compact }: PreviewPaneProps) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = stage.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vp = VIEWPORTS[viewport];
  const scale = fitScale(vp.width, vp.height, box.w, box.h);
  return (
    <section ref={root} className={styles.preview} aria-label="Preview" data-state={stale ? 'stale' : paused ? 'paused' : 'live'}>
      <div className={styles.previewHead}>
        <span className={styles.previewTitle}>Preview</span>
        <span className={cx(styles.liveDot, stale && styles.staleDot)} aria-hidden="true" />
        <span className={styles.previewState}>{stale ? 'Stale' : paused ? 'Paused' : 'Live'}</span>
      </div>
      <PreviewToolbar
        viewport={viewport} onViewport={onViewport} scale={scale} theme={theme} onTheme={onTheme} density={density} onDensity={onDensity}
        paused={paused} onPause={onPause} onRefresh={onRefresh} stale={!!stale} compact={compact}
        onFullscreen={() => { void root.current?.requestFullscreen?.().catch(() => undefined); }}
      />
      {stale && (
        <MessageStrip
          tone="warning"
          className={styles.staleStrip}
          title="Preview is stale"
          actions={<><Button size="sm" onClick={onGoToError}>Go to error</Button><Button size="sm" variant="tertiary" onClick={onRetry}>Retry</Button></>}
        >
          Showing the last good build. {stale.message.split('\n')[0]}{' '}
          <Link href="#" onClick={(e) => { e.preventDefault(); onGoToError(); }}>{stale.file}{stale.line ? `:${stale.line}` : ''}</Link>
        </MessageStrip>
      )}
      <div ref={stage} className={styles.stage}>
        <div
          className={cx(styles.frameBox, stale && styles.staleFrame)}
          data-testid="preview-frame-box"
          style={box.w ? { width: vp.width * scale, height: vp.height * scale } : undefined}
        >
          <div className={styles.frameScaler} style={{ width: vp.width, height: vp.height, transform: `scale(${scale})` }}>{children}</div>
        </div>
      </div>
    </section>
  );
}
