import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, Copy, RotateCcw } from 'lucide-react';
import { Button } from '@enterprise-ui/react';
import type { Density, ThemePreference } from '@enterprise-ui/react';
import { playgrounds } from '../playgrounds';
import { docsBySlug } from '../registry';
import { href } from '../router';
import { decodePlaygroundCode, playgroundCodeParam } from '../playgroundLink';
import styles from './PlaygroundPage.module.css';

const defaultsFor = (slug: string) => {
  const def = playgrounds[slug];
  return def.code(Object.fromEntries(def.controls.map((control) => [control.name, control.default])));
};

export function PlaygroundPage({ initialSlug, theme, density }: { initialSlug: string; theme: ThemePreference; density: Density }) {
  const options = useMemo(() => Object.keys(playgrounds).sort((a, b) => (docsBySlug.get(a)?.name ?? a).localeCompare(docsBySlug.get(b)?.name ?? b)), []);
  const slug = playgrounds[initialSlug] ? initialSlug : 'button';
  const [code, setCode] = useState(() => defaultsFor(slug));
  // Code opened from an example ("Open in Playground") replaces the component defaults; Reset restores it.
  const [initialCode, setInitialCode] = useState<string | null>(null);
  const encoded = playgroundCodeParam();
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const name = docsBySlug.get(slug)?.name ?? slug;
  const send = useCallback(() => frame.current?.contentWindow?.postMessage({ source: 'eui-docs', type: 'render', code, theme, density }, '*'), [code, theme, density]);
  useEffect(() => {
    if (encoded) return;
    setInitialCode(null); setCode(defaultsFor(slug)); setError('');
  }, [slug, encoded]);
  useEffect(() => {
    if (!encoded) return;
    let active = true;
    void decodePlaygroundCode(encoded).then((decoded) => {
      if (!active) return;
      if (decoded === null) { setError('The shared example could not be opened. The link may be incomplete or expired.'); return; }
      setInitialCode(decoded); setCode(decoded); setError('');
    });
    return () => { active = false; };
  }, [encoded]);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.source !== 'eui-playground') return;
      if (event.data.type === 'ready') setReady(true);
      if (event.data.type === 'error' && typeof event.data.message === 'string') setError(event.data.message);
      if (event.data.type === 'success') setError('');
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  useEffect(() => { if (ready) { const timer = setTimeout(send, 300); return () => clearTimeout(timer); } }, [ready, send]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { setError('Could not copy. Select the code and copy it manually.'); }
  };
  return <main className={styles.page}>
    <header className={styles.header}>
      <a className={styles.back} href={href(`/components/${slug}`)}><ChevronLeft size={16} /> Documentation</a>
      <div className={styles.heading}><span className={styles.eyebrow}>ENTERPRISE UI / WORKSPACE</span><h1>Component playground</h1></div>
      <div className={styles.headerRight}><span className={styles.live}><span /> Live preview</span><a className={styles.allLink} href={href('/components')}>All components ↗</a></div>
    </header>
    <div className={styles.workspace}>
      <section className={styles.panel} aria-labelledby="preview-heading">
        <div className={styles.panelBar}><div><span className={styles.panelIndex}>01 / RENDER</span><h2 id="preview-heading">Preview</h2></div><label className={styles.selectLabel}>Component <select value={slug} onChange={(event) => { window.location.hash = `/playground/${event.target.value}`; }} aria-label="Playground component">{options.map((option) => <option key={option} value={option}>{docsBySlug.get(option)?.name ?? option}</option>)}</select></label></div>
        <div className={styles.canvas}><iframe ref={frame} title={`${name} live preview`} sandbox="allow-scripts" src={`${import.meta.env.BASE_URL}playground-frame.html`} className={styles.frame} onLoad={() => frame.current?.contentWindow?.postMessage({ source: 'eui-docs', type: 'init' }, '*')} /></div>
        <div className={styles.panelFoot}><span><span className={styles.dot} /> {error ? 'Preview needs attention' : ready ? 'Preview is ready' : 'Starting preview…'}</span><span>ISOLATED RENDER</span></div>
      </section>
      <section className={styles.panel} aria-labelledby="editor-heading">
        <div className={styles.panelBar}><div><span className={styles.panelIndex}>02 / SOURCE</span><h2 id="editor-heading">Editor</h2></div><div className={styles.actions}><Button size="sm" icon={<RotateCcw />} onClick={() => { setCode(initialCode ?? defaultsFor(slug)); setError(''); }}>Reset</Button><Button size="sm" variant="primary" icon={copied ? <Check /> : <Copy />} onClick={() => void copy()}>{copied ? 'Copied' : 'Copy code'}</Button></div></div>
        <div className={styles.fileBar}><span className={styles.fileIcon}>✳</span><span>Example.tsx</span><span className={styles.fileMeta}>TSX</span></div>
        <div className={styles.editorWrap}><textarea className={styles.editor} aria-label={`${name} playground code`} spellCheck={false} value={code} onChange={(event) => setCode(event.target.value)} /></div>
        {error && <div className={styles.error} role="alert"><strong>Preview error</strong><span>{error}</span></div>}
        <div className={styles.panelFoot}><span>Changes render automatically</span><span>JSX EXPRESSION</span></div>
      </section>
    </div>
    <footer className={styles.footer}><span>Write JSX after your imports. Available imports: React, Enterprise UI, and Lucide React.</span><span>Preview runs in a sandboxed frame.</span></footer>
  </main>;
}
