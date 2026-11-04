import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Link, MessageStrip, type Density, type ThemeName } from '@enterprise-ui/react';
import { cx } from '../../../src/utilities/cx';
import { fitScale, VIEWPORTS, type PreviewSize, type ViewportId } from '../app/workspace/layout';
import { zoomScale } from './previewSize';
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
  /** C4: the project's custom size (null = the viewport preset at Fit). */
  customSize?: PreviewSize | null;
  onCustomSize?: (size: PreviewSize | null) => void;
  /** C4: a runtime error after a good build; shown over the (kept) frame. */
  runtimeError?: { message: string; file: string | null; line: number | null } | null;
  onGoToRuntimeError?: () => void;
  onDismissRuntimeError?: () => void;
}

export function PreviewPane({ children, theme, onTheme, density, onDensity, viewport, onViewport, paused, onPause, onRefresh, stale, onGoToError, onRetry, compact, customSize = null, onCustomSize, runtimeError = null, onGoToRuntimeError, onDismissRuntimeError }: PreviewPaneProps) {
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
  const preset = VIEWPORTS[viewport];
  const vp = customSize ?? preset;
  const fit = fitScale(vp.width, vp.height, box.w, box.h);
  const scale = zoomScale(customSize?.zoom ?? 'fit', fit);
  return (
    <section ref={root} className={styles.preview} aria-label="Preview" data-state={stale ? 'stale' : paused ? 'paused' : 'live'}>
      <div className={styles.previewHead}>
        <span className={styles.previewTitle}>Preview</span>
        <span className={cx(styles.liveDot, stale && styles.staleDot)} aria-hidden="true" />
        <span className={styles.previewState}>{stale ? 'Stale' : paused ? 'Paused' : 'Live'}</span>
      </div>
      <PreviewToolbar
        viewport={viewport} onViewport={onViewport} scale={fit}
        size={{ width: vp.width, height: vp.height, zoom: customSize?.zoom ?? 'fit', custom: !!customSize }} onCustomSize={onCustomSize} theme={theme} onTheme={onTheme} density={density} onDensity={onDensity}
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
      <div ref={stage} className={styles.stage} style={scale > fit ? { overflow: 'auto' } : undefined}>
        {runtimeError && (
          <MessageStrip tone="error" className={styles.runtimeOverlay} title="Runtime error" announce="assertive" data-testid="runtime-overlay" key={runtimeError.message}
            dismissible onDismiss={onDismissRuntimeError}
            actions={runtimeError.file ? <Button size="sm" onClick={onGoToRuntimeError}>Open source</Button> : undefined}>
            {runtimeError.message.split('\n')[0]}{' '}
            {runtimeError.file && <Link href="#" onClick={(e) => { e.preventDefault(); onGoToRuntimeError?.(); }}>{runtimeError.file}{runtimeError.line ? `:${runtimeError.line}` : ''}</Link>}
          </MessageStrip>
        )}
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
