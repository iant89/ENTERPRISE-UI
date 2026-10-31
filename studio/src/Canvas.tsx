import { useCallback, useEffect, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import type { Density, ThemeName } from '@enterprise-ui/react';
import { findNode, parentId, type StudioNode } from './model/jsx';
import { acceptsChildren } from './model/catalog';
import styles from './Studio.module.css';

export interface Box { id: string; x: number; y: number; width: number; height: number }
export interface DropTarget { parentId: string; index: number; /** Box the indicator is drawn for. */ box: Box | null; mode: 'inside' | 'before' | 'after' }

/** MIME type for components dragged from the palette. */
export const COMPONENT_MIME = 'application/x-eui-component';
/** MIME type for nodes dragged within the canvas or outline. */
export const NODE_MIME = 'application/x-eui-node';

export interface CanvasProps {
  /** Instrumented page code. */
  code: string;
  root: StudioNode | null;
  theme: ThemeName;
  density: Density;
  design: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDropComponent: (name: string, target: DropTarget) => void;
  onDropNode: (id: string, target: DropTarget) => void;
  onStatus: (status: { error: string | null; ready: boolean }) => void;
}

const contains = (box: Box, x: number, y: number) => x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;

/** Deepest element box under the point (the smallest one containing it). */
export function hitTest(boxes: Box[], x: number, y: number): Box | null {
  return boxes.filter((b) => contains(b, x, y)).sort((a, b) => a.width * a.height - b.width * b.height || b.id.length - a.id.length)[0] ?? null;
}

/** Where a drop at (x, y) lands: inside containers, otherwise before or after the hovered element. */
export function resolveDrop(root: StudioNode | null, boxes: Box[], x: number, y: number): DropTarget | null {
  if (!root) return null;
  const hit = hitTest(boxes, x, y);
  const node = hit ? findNode(root, hit.id) : null;
  if (!hit || !node) {
    return root.kind === 'fragment' || acceptsChildren(root.name) ? { parentId: root.id, index: root.children.length, box: boxes.find((b) => b.id === root.id) ?? null, mode: 'inside' } : null;
  }
  const parent = parentId(node.id);
  const vertical = y < hit.y + hit.height / 2;
  const edge = Math.min(12, hit.height / 4);
  const nearEdge = y < hit.y + edge || y > hit.y + hit.height - edge;
  if (acceptsChildren(node.name) && (!parent || !nearEdge)) return { parentId: node.id, index: node.children.length, box: hit, mode: 'inside' };
  if (!parent) return null;
  const index = Number(node.id.slice(node.id.lastIndexOf('.') + 1));
  return { parentId: parent, index: vertical ? index : index + 1, box: hit, mode: vertical ? 'before' : 'after' };
}

export function Canvas({ code, root, theme, density, design, selectedId, onSelect, onDropComponent, onDropNode, onStatus }: CanvasProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const [drop, setDrop] = useState<DropTarget | null>(null);
  const statusRef = useRef(onStatus);
  statusRef.current = onStatus;

  const post = useCallback((message: Record<string, unknown>) => frame.current?.contentWindow?.postMessage({ source: 'eui-docs', ...message }, '*'), []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.source !== 'eui-playground') return;
      const { type } = event.data;
      if (type === 'ready') setReady(true);
      else if (type === 'layout' && Array.isArray(event.data.nodes)) setBoxes(event.data.nodes as Box[]);
      else if (type === 'success') statusRef.current({ error: null, ready: true });
      else if (type === 'error') statusRef.current({ error: String(event.data.message), ready: true });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => post({ type: 'render', code, theme, density, design }), 150);
    return () => clearTimeout(timer);
  }, [ready, code, theme, density, design, post]);

  const point = (event: MouseEvent | DragEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const isOurDrag = (event: DragEvent) => event.dataTransfer.types.includes(COMPONENT_MIME) || event.dataTransfer.types.includes(NODE_MIME);
  const selectedBox = boxes.find((b) => b.id === selectedId);
  const hoverBox = boxes.find((b) => b.id === hover && b.id !== selectedId);

  return (
    <div className={styles.canvas}>
      <iframe
        ref={frame}
        title="Page preview"
        sandbox="allow-scripts"
        src="./preview.html"
        className={styles.frame}
        onLoad={() => post({ type: 'init' })}
      />
      {design && (
        <div
          className={styles.overlay}
          aria-hidden="true"
          data-testid="canvas-overlay"
          onMouseMove={(e) => { const p = point(e); setHover(hitTest(boxes, p.x, p.y)?.id ?? null); }}
          onMouseLeave={() => setHover(null)}
          onClick={(e) => { const p = point(e); onSelect(hitTest(boxes, p.x, p.y)?.id ?? null); }}
          onWheel={(e) => post({ type: 'scroll', deltaY: e.deltaY })}
          draggable={!!selectedBox}
          onDragStart={(e) => {
            const p = point(e);
            const hit = hitTest(boxes, p.x, p.y);
            if (!hit || hit.id !== selectedId || !parentId(hit.id)) { e.preventDefault(); return; }
            e.dataTransfer.setData(NODE_MIME, hit.id);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragOver={(e) => {
            if (!isOurDrag(e)) return;
            e.preventDefault();
            const p = point(e);
            setDrop(resolveDrop(root, boxes, p.x, p.y));
          }}
          onDragLeave={() => setDrop(null)}
          onDrop={(e) => {
            e.preventDefault();
            const p = point(e);
            const target = resolveDrop(root, boxes, p.x, p.y);
            setDrop(null);
            if (!target) return;
            const name = e.dataTransfer.getData(COMPONENT_MIME);
            const node = e.dataTransfer.getData(NODE_MIME);
            if (name) onDropComponent(name, target);
            else if (node) onDropNode(node, target);
          }}
        >
          {hoverBox && <div className={styles.hoverBox} style={boxStyle(hoverBox)} />}
          {selectedBox && <div className={styles.selectedBox} style={boxStyle(selectedBox)}><span className={styles.boxLabel}>{findNode(root, selectedBox.id)?.name || 'Fragment'}</span></div>}
          {drop?.box && <div className={drop.mode === 'inside' ? styles.dropInside : styles.dropLine} style={drop.mode === 'inside' ? boxStyle(drop.box) : lineStyle(drop.box, drop.mode)} />}
        </div>
      )}
    </div>
  );
}

const boxStyle = (b: Box) => ({ left: b.x, top: b.y, width: b.width, height: b.height });
const lineStyle = (b: Box, mode: DropTarget['mode']) => ({ left: b.x, top: mode === 'before' ? b.y - 2 : b.y + b.height - 1, width: b.width });
