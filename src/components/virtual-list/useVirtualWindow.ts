/** Calculate a bounded fixed-height viewport window. Scroll position is clamped when data shrinks. */
export function getVirtualWindow(count: number, rowHeight: number, viewportHeight: number, scrollTop: number, overscan: number) {
  const position = Math.min(Math.max(0, scrollTop), Math.max(0, count * rowHeight - viewportHeight));
  return { start: Math.max(0, Math.floor(position / rowHeight) - overscan), end: Math.min(count, Math.ceil((position + viewportHeight) / rowHeight) + overscan) };
}
