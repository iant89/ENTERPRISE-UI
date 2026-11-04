// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureHost, envelope, frameNonceGate, hostBridge, type FrameMessages } from '../../studio/src/preview/bridge';

describe('bridge nonce (QA 6)', () => {
  let dispose = () => {};
  afterEach(() => { dispose(); document.body.innerHTML = ''; });

  function setup() {
    const iframe = document.createElement('iframe');
    document.body.append(iframe);
    const win = iframe.contentWindow!;
    const sent: unknown[] = [];
    vi.spyOn(win, 'postMessage').mockImplementation(((data: unknown) => { sent.push(data); }) as never);
    const got = vi.fn();
    const b = hostBridge(() => iframe, got);
    dispose = b.dispose;
    const fromFrame = (data: unknown) => window.dispatchEvent(new MessageEvent('message', { data, source: win }));
    return { b, got, sent, fromFrame };
  }
  const forged = (nonce?: string) => envelope<FrameMessages, 'console'>('console', { level: 'log', args: ['forged'], path: 'src/App.tsx', line: 1, column: 1 }, nonce);

  it('ignores frame messages without the nonce or with a wrong one', () => {
    const { b, got, fromFrame } = setup();
    b.post('init', {});
    fromFrame(forged());
    fromFrame(forged('guess'));
    fromFrame(envelope<FrameMessages, 'runtime-error'>('runtime-error', { message: 'fake', path: 'src/App.tsx', line: 1, column: 1 }));
    expect(got).not.toHaveBeenCalled();
  });

  it('accepts messages echoing the init nonce, and rotates it on the next init', () => {
    const { b, got, sent, fromFrame } = setup();
    b.post('init', {});
    const nonce = (sent[0] as { nonce: string }).nonce;
    expect(nonce).toMatch(/\w{8,}/);
    fromFrame(forged(nonce));
    expect(got).toHaveBeenCalledTimes(1);
    b.post('init', {});
    fromFrame(forged(nonce));
    expect(got).toHaveBeenCalledTimes(1);
  });

  it('only the init message carries the nonce', () => {
    const { b, sent } = setup();
    b.post('init', {});
    b.post('scroll', { deltaY: 1 });
    expect((sent[1] as { nonce?: string }).nonce).toBeUndefined();
  });
});

describe('frame nonce gate', () => {
  const parent = {};
  it('accepts init only from window.parent', () => {
    const g = frameNonceGate(parent);
    expect(g.init({}, { nonce: 'evil' })).toBe(false);
    expect(g.init(null, { nonce: 'evil' })).toBe(false);
    expect(g.get()).toBeUndefined();
    expect(g.init(parent, { nonce: 'n1' })).toBe(true);
    expect(g.get()).toBe('n1');
  });
  it('keeps the first nonce per load and ignores later inits', () => {
    const g = frameNonceGate(parent);
    g.init(parent, { nonce: 'n1' });
    g.init(parent, { nonce: 'n2' });
    expect(g.get()).toBe('n1');
  });
});

describe('F8: frame captures the host at load', () => {
  it('keeps posting to the captured host after window.parent and postMessage are swapped', () => {
    const real = vi.fn();
    const fakeWin = { postMessage: real } as unknown as Window & { postMessage: unknown };
    const h = captureHost(fakeWin);
    const spy = vi.fn();
    fakeWin.postMessage = spy; // user code replaces the method on the host object
    h.post({ nonce: 'secret' });
    expect(real).toHaveBeenCalledWith({ nonce: 'secret' }, '*');
    expect(spy).not.toHaveBeenCalled();
    expect(h.host).toBe(fakeWin);
  });
});
