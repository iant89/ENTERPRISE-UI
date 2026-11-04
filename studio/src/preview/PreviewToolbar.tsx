import { Badge, IconButton, Select, THEMES, type Density, type ThemeName } from '@enterprise-ui/react';
import { Maximize2, Monitor, Pause, Play, RefreshCw, Smartphone, Tablet } from 'lucide-react';
import { cx } from '../../../src/utilities/cx';
import { VIEWPORTS, type ViewportId } from '../app/workspace/layout';
import styles from '../app/workspace/CodeWorkspace.module.css';

export interface PreviewToolbarProps {
  viewport: ViewportId;
  onViewport: (v: ViewportId) => void;
  /** Fit scale, 0–1. */
  scale: number;
  theme: ThemeName;
  onTheme: (t: ThemeName) => void;
  density: Density;
  onDensity: (d: Density) => void;
  paused: boolean;
  onPause: () => void;
  onRefresh: () => void;
  onFullscreen: () => void;
  stale: boolean;
  compact?: boolean;
}

const ICONS: Record<ViewportId, typeof Monitor> = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };

/**
 * Decision 4: the preview theme Select changes only the iframe (all seven themes), independent of
 * the Studio theme. Viewport presets, a read-only "W × H · Fit (n%)" label, density, refresh, pause, fullscreen.
 */
export function PreviewToolbar({ viewport, onViewport, scale, theme, onTheme, density, onDensity, paused, onPause, onRefresh, onFullscreen, stale, compact }: PreviewToolbarProps) {
  const vp = VIEWPORTS[viewport];
  return (
    <div className={styles.previewToolbarWrap}>
      <div className={styles.previewToolbar} role="toolbar" aria-label="Preview tools">
        <div role="group" aria-label="Viewport" className={styles.viewports}>
          {(Object.keys(VIEWPORTS) as ViewportId[]).map((id) => {
            const Icon = ICONS[id];
            return (
              <button key={id} type="button" aria-pressed={viewport === id} aria-label={`${VIEWPORTS[id].label} viewport`} title={VIEWPORTS[id].label}
                className={cx(styles.viewportButton, viewport === id && styles.viewportOn)} onClick={() => onViewport(id)}>
                <Icon aria-hidden="true" />
              </button>
            );
          })}
        </div>
        {stale && <Badge tone="warning">Stale</Badge>}
        <span className={styles.toolbarGrow} />
        <span className={styles.themeField}><Select size="sm" label="Preview theme" hideLabel value={theme} onChange={(v) => v && onTheme(v as ThemeName)}
          options={THEMES.map((t) => ({ value: t.name, label: t.label }))} /></span>
        {!compact && (
          <span className={styles.densityField}><Select size="sm" label="Preview density" hideLabel value={density} onChange={(v) => v && onDensity(v as Density)}
            options={[{ value: 'cozy', label: 'Cozy' }, { value: 'compact', label: 'Compact' }]} /></span>
        )}
        <IconButton size="sm" variant="tertiary" icon={<RefreshCw />} label="Refresh preview" onClick={onRefresh} />
        <IconButton size="sm" variant="tertiary" icon={paused ? <Play /> : <Pause />} label={paused ? 'Resume preview' : 'Pause preview'} aria-pressed={paused} onClick={onPause} />
        {!compact && <IconButton size="sm" variant="tertiary" icon={<Maximize2 />} label="Fullscreen preview" onClick={onFullscreen} />}
      </div>
      <div className={styles.fitLabel} data-testid="preview-size">{vp.width} × {vp.height} · Fit ({Math.round(scale * 100)}%)</div>
    </div>
  );
}
