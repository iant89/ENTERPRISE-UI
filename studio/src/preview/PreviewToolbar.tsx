import { Badge, IconButton, Select, THEMES, type Density, type ThemeName, FullScreenIcon, IpadIcon, IphoneIcon, MediaPauseIcon, MediaPlayIcon, RefreshIcon, SysMonitorIcon } from '@enterprise-ui/react';
import { cx } from '../../../src/utilities/cx';
import { VIEWPORTS, type PreviewSize, type PreviewZoom, type ViewportId } from '../app/workspace/layout';
import { PreviewSizePopover } from './PreviewSizePopover';
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
  /** C4: the frame size and zoom shown in the label (the preset, or the project's custom size). */
  size?: { width: number; height: number; zoom: PreviewZoom; custom: boolean };
  onCustomSize?: (size: PreviewSize | null) => void;
}

const ICONS: Record<ViewportId, typeof SysMonitorIcon> = { desktop: SysMonitorIcon, tablet: IpadIcon, mobile: IphoneIcon };

/**
 * Decision 4: the preview theme Select changes only the iframe (all seven themes), independent of
 * the Studio theme. Viewport presets, a "W × H · Fit (n%)" label, density, refresh, pause, fullscreen.
 */
export function PreviewToolbar({ viewport, onViewport, scale, theme, onTheme, density, onDensity, paused, onPause, onRefresh, onFullscreen, stale, compact, size, onCustomSize }: PreviewToolbarProps) {
  const vp = VIEWPORTS[viewport];
  const shown = size ?? { width: vp.width, height: vp.height, zoom: 'fit' as const, custom: false };
  return (
    <div className={styles.previewToolbarWrap}>
      <div className={styles.previewToolbar} role="toolbar" aria-label="Preview tools">
        <div role="group" aria-label="Viewport" className={styles.viewports}>
          {(Object.keys(VIEWPORTS) as ViewportId[]).map((id) => {
            const Icon = ICONS[id];
            return (
              <button key={id} type="button" aria-pressed={viewport === id && !shown.custom} aria-label={`${VIEWPORTS[id].label} viewport`} title={VIEWPORTS[id].label}
                className={cx(styles.viewportButton, viewport === id && !shown.custom && styles.viewportOn)} onClick={() => { if (shown.custom) onCustomSize?.(null); onViewport(id); }}>
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
        <IconButton size="sm" variant="tertiary" icon={<RefreshIcon />} label="Refresh preview" onClick={onRefresh} />
        <IconButton size="sm" variant="tertiary" icon={paused ? <MediaPlayIcon /> : <MediaPauseIcon />} label={paused ? 'Resume preview' : 'Pause preview'} aria-pressed={paused} onClick={onPause} />
        {!compact && <IconButton size="sm" variant="tertiary" icon={<FullScreenIcon />} label="Fullscreen preview" onClick={onFullscreen} />}
      </div>
      {onCustomSize
        ? <PreviewSizePopover size={shown} fit={scale} onApply={onCustomSize} onReset={() => { onCustomSize(null); onViewport('desktop'); }} />
        : <div className={styles.fitLabel} data-testid="preview-size">{vp.width} × {vp.height} · Fit ({Math.round(scale * 100)}%)</div>}
    </div>
  );
}
