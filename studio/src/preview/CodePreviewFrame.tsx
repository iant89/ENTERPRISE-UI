import { useEffect, useRef, useState } from 'react';
import type { Density, ThemeName } from '@enterprise-ui/react';
import { hostBridge, type ConsoleLevel, type FrameMessages, type SourceLocation } from './bridge';
import type { PreviewArtifact } from './compiler';
import styles from '../Studio.module.css';

export interface CodePreviewFrameProps {
  artifact: PreviewArtifact | null;
  theme: ThemeName;
  density: Density;
  onConsole: (level: ConsoleLevel, args: string[], location: SourceLocation) => void;
  onRuntimeError: (error: { message: string } & SourceLocation) => void;
  /** A new artifact rendered successfully. */
  onSuccess: (hash: string) => void;
}

/** Code Studio C4: the sandboxed preview frame for compiled artifacts (no `allow-same-origin`). */
export function CodePreviewFrame({ artifact, theme, density, onConsole, onRuntimeError, onSuccess }: CodePreviewFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const bridge = useRef<ReturnType<typeof hostBridge> | null>(null);
  const handlers = useRef({ onConsole, onRuntimeError, onSuccess });
  handlers.current = { onConsole, onRuntimeError, onSuccess };
  useEffect(() => {
    const b = hostBridge(() => frame.current, (m) => {
      if (m.type === 'ready') setReady(true);
      else if (m.type === 'console') { const p = m.payload as FrameMessages['console']; handlers.current.onConsole(p.level, p.args, { path: p.path ?? null, line: p.line ?? null, column: p.column ?? null }); }
      else if (m.type === 'runtime-error') { const p = m.payload as FrameMessages['runtime-error']; handlers.current.onRuntimeError({ message: p.message, path: p.path ?? null, line: p.line ?? null, column: p.column ?? null }); }
      else if (m.type === 'success') handlers.current.onSuccess((m.payload as FrameMessages['success']).hash ?? '');
    });
    bridge.current = b;
    return () => { b.dispose(); bridge.current = null; };
  }, []);
  useEffect(() => {
    if (ready && artifact) bridge.current?.post('run', { artifact, theme, density });
  }, [ready, artifact, theme, density]);
  return (
    <div className={styles.canvas}>
      <iframe ref={frame} title="Page preview" sandbox="allow-scripts" src="./preview.html" className={styles.frame} onLoad={() => bridge.current?.post('init', {})} />
    </div>
  );
}
