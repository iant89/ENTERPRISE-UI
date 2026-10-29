import { ResizablePanel } from '@enterprise-ui/react';

export const title = 'Resizable panel';
export const description = 'The handle is a focusable `separator` with `aria-valuenow`. Home/End jump to the minimum and maximum size.';

export default function ResizablePanelBasic() {
  return (
    <div style={{ display: 'flex', height: 200, border: '1px solid var(--eui-color-border)', borderRadius: 8, overflow: 'hidden' }}>
      <ResizablePanel defaultSize={240} minSize={160} maxSize={480} handleLabel="Resize filters panel" style={{ background: 'var(--eui-color-surface-alt)', borderInlineEnd: '1px solid var(--eui-color-border)' }}>
        <div style={{ padding: 16 }}>Filters</div>
      </ResizablePanel>
      <div style={{ flex: 1, padding: 16 }}>Results</div>
    </div>
  );
}
