/**
 * QR code encoder (ISO/IEC 18004), dependency-free: error-correction levels
 * L/M/Q/H, versions 1–40, numeric / alphanumeric / byte (UTF-8) modes chosen
 * from the text, and the mask chosen by the standard's penalty rules.
 * Tests decode its output with the vendored zxing reader.
 */

/** Error-correction level: about 7% (L), 15% (M), 25% (Q) or 30% (H) of the code can be damaged. */
export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';
export type QrMode = 'numeric' | 'alphanumeric' | 'byte';

export interface QrEncodeOptions {
  /** @default 'M' */
  errorCorrection?: QrErrorCorrection;
  /** Smallest version to use (1–40). @default 1 */
  minVersion?: number;
  /** Largest version to use (1–40). @default 40 */
  maxVersion?: number;
  /** Force a mask pattern (0–7); by default the lowest-penalty mask is used. */
  mask?: number;
  /** Raise the error-correction level when it fits in the same version. @default false */
  boostErrorCorrection?: boolean;
}

export interface QrCodeMatrix {
  /** 1–40. */
  version: number;
  /** Modules per side (17 + 4 × version). */
  size: number;
  /** Row-major; `true` is a dark module. */
  modules: boolean[][];
  /** The level actually used (higher than requested when boosted). */
  errorCorrection: QrErrorCorrection;
  mask: number;
  mode: QrMode;
}

export class QrCodeTooLongError extends Error {
  constructor(readonly length: number, readonly errorCorrection: QrErrorCorrection, readonly maxVersion: number) {
    super(`The text is too long for a QR code at level ${errorCorrection} (version ${maxVersion} or smaller).`);
    this.name = 'QrCodeTooLongError';
  }
}

const LEVELS: readonly QrErrorCorrection[] = ['L', 'M', 'Q', 'H'];
/** Format-information bits per level. */
const LEVEL_BITS: Record<QrErrorCorrection, number> = { L: 1, M: 0, Q: 3, H: 2 };

// Per level, per version (index 0 unused): EC codewords per block and number of blocks.
const EC_PER_BLOCK: Record<QrErrorCorrection, readonly number[]> = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};
const BLOCKS: Record<QrErrorCorrection, readonly number[]> = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};

const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
const MODE_BITS: Record<QrMode, number> = { numeric: 0b0001, alphanumeric: 0b0010, byte: 0b0100 };

/** Bits of the character count, by mode and version range (1–9, 10–26, 27–40). */
function countBits(mode: QrMode, version: number): number {
  const range = version <= 9 ? 0 : version <= 26 ? 1 : 2;
  return { numeric: [10, 12, 14], alphanumeric: [9, 11, 13], byte: [8, 16, 16] }[mode][range]!;
}

/** Modules available for data and error correction (everything but function patterns). */
function rawDataModules(version: number): number {
  let n = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const align = Math.floor(version / 7) + 2;
    n -= (25 * align - 10) * align - 55;
    if (version >= 7) n -= 36;
  }
  return n;
}
const totalCodewords = (version: number) => Math.floor(rawDataModules(version) / 8);
/** Data codewords for a version and level. */
export function qrDataCodewords(version: number, level: QrErrorCorrection): number {
  return totalCodewords(version) - EC_PER_BLOCK[level][version]! * BLOCKS[level][version]!;
}

// --- Segment -------------------------------------------------------------------
interface Segment { mode: QrMode; count: number; bits: number[] }

function segment(text: string): Segment {
  const bits: number[] = [];
  const put = (value: number, length: number) => { for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
  if (/^[0-9]*$/.test(text)) {
    for (let i = 0; i < text.length; i += 3) {
      const chunk = text.slice(i, i + 3);
      put(Number(chunk), chunk.length * 3 + 1);
    }
    return { mode: 'numeric', count: text.length, bits };
  }
  if ([...text].every((c) => ALPHANUMERIC.includes(c))) {
    for (let i = 0; i < text.length; i += 2) {
      const a = ALPHANUMERIC.indexOf(text[i]!);
      if (i + 1 < text.length) put(a * 45 + ALPHANUMERIC.indexOf(text[i + 1]!), 11);
      else put(a, 6);
    }
    return { mode: 'alphanumeric', count: text.length, bits };
  }
  const bytes = new TextEncoder().encode(text);
  for (const b of bytes) put(b, 8);
  return { mode: 'byte', count: bytes.length, bits };
}

const segmentBits = (s: Segment, version: number) => 4 + countBits(s.mode, version) + s.bits.length;

// --- Reed–Solomon over GF(256), polynomial 0x11D ---------------------------------
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) {
  EXP[i] = x;
  LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]!;
const gfMul = (a: number, b: number) => (a && b ? EXP[LOG[a]! + LOG[b]!]! : 0);

const generators = new Map<number, number[]>();
function generator(degree: number): number[] {
  let poly = generators.get(degree);
  if (poly) return poly;
  poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j]! ^= poly[j]!;
      next[j + 1]! ^= gfMul(poly[j]!, EXP[i]!);
    }
    poly = next;
  }
  generators.set(degree, poly);
  return poly;
}

function ecCodewords(data: number[], degree: number): number[] {
  const gen = generator(degree);
  const out = [...data, ...new Array<number>(degree).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const factor = out[i]!;
    if (factor) for (let j = 0; j < gen.length; j++) out[i + j]! ^= gfMul(gen[j]!, factor);
  }
  return out.slice(data.length);
}

function codewords(seg: Segment, version: number, level: QrErrorCorrection): number[] {
  const capacity = qrDataCodewords(version, level);
  const bits: number[] = [];
  const put = (value: number, length: number) => { for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
  put(MODE_BITS[seg.mode], 4);
  put(seg.count, countBits(seg.mode, version));
  bits.push(...seg.bits);
  put(0, Math.min(4, capacity * 8 - bits.length)); // terminator
  while (bits.length % 8) bits.push(0);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((v, b) => (v << 1) | b, 0));
  for (let pad = 0; data.length < capacity; pad++) data.push(pad % 2 ? 0x11 : 0xec);

  // Blocks: the first ones are one data codeword shorter when the split is uneven.
  const blockCount = BLOCKS[level][version]!;
  const ecLength = EC_PER_BLOCK[level][version]!;
  const total = totalCodewords(version);
  const shortBlocks = blockCount - (total % blockCount);
  const shortData = Math.floor(total / blockCount) - ecLength;
  const blocks: number[][] = [];
  for (let i = 0, offset = 0; i < blockCount; i++) {
    const length = shortData + (i < shortBlocks ? 0 : 1);
    blocks.push(data.slice(offset, offset + length));
    offset += length;
  }
  const ec = blocks.map((b) => ecCodewords(b, ecLength));
  const out: number[] = [];
  for (let i = 0; i <= shortData; i++) for (const b of blocks) if (i < b.length) out.push(b[i]!);
  for (let i = 0; i < ecLength; i++) for (const e of ec) out.push(e[i]!);
  return out;
}

// --- Matrix --------------------------------------------------------------------
function alignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const size = 17 + 4 * version;
  const step = version === 32 ? 26 : Math.ceil((size - 13) / (2 * count - 2)) * 2;
  const positions = [6];
  for (let pos = size - 7; positions.length < count; pos -= step) positions.splice(1, 0, pos);
  return positions;
}

/** `value` followed by its BCH remainder for the given generator polynomial. */
function bch(value: number, poly: number): number {
  const degree = 31 - Math.clz32(poly);
  let r = value << degree;
  for (let top = 31 - Math.clz32(r); r && top >= degree; top = 31 - Math.clz32(r)) r ^= poly << (top - degree);
  return (value << degree) | r;
}

class Grid {
  readonly modules: boolean[][];
  readonly reserved: boolean[][];
  constructor(readonly size: number) {
    this.modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
    this.reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  }
  set(x: number, y: number, dark: boolean) {
    this.modules[y]![x] = dark;
    this.reserved[y]![x] = true;
  }
}

function drawFunctionPatterns(grid: Grid, version: number, level: QrErrorCorrection) {
  const { size } = grid;
  for (let i = 0; i < size; i++) {
    grid.set(6, i, i % 2 === 0);
    grid.set(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]] as const) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (x < 0 || y < 0 || x >= size || y >= size) continue;
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      grid.set(x, y, d !== 2 && d !== 4);
    }
  }
  const pos = alignmentPositions(version);
  const last = pos.length - 1;
  pos.forEach((cy, i) => pos.forEach((cx, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) grid.set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }));
  drawFormat(grid, level, 0); // reserves the format areas; rewritten after masking
  if (version >= 7) {
    const bits = bch(version, 0x1f25);
    for (let i = 0; i < 18; i++) {
      const dark = ((bits >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      grid.set(a, b, dark);
      grid.set(b, a, dark);
    }
  }
}

function drawFormat(grid: Grid, level: QrErrorCorrection, mask: number) {
  const { size } = grid;
  const bits = bch((LEVEL_BITS[level] << 3) | mask, 0x537) ^ 0x5412;
  const bit = (i: number) => ((bits >>> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) grid.set(8, i, bit(i));
  grid.set(8, 7, bit(6));
  grid.set(8, 8, bit(7));
  grid.set(7, 8, bit(8));
  for (let i = 9; i < 15; i++) grid.set(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) grid.set(size - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) grid.set(8, size - 15 + i, bit(i));
  grid.set(8, size - 8, true); // the dark module
}

function drawCodewords(grid: Grid, data: number[]) {
  const { size } = grid;
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!grid.reserved[y]![x] && i < data.length * 8) {
          grid.modules[y]![x] = ((data[i >>> 3]! >>> (7 - (i & 7))) & 1) === 1;
          i++;
        }
      }
    }
  }
}

const MASKS: ReadonlyArray<(x: number, y: number) => boolean> = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function applyMask(grid: Grid, mask: number) {
  const test = MASKS[mask]!;
  for (let y = 0; y < grid.size; y++) for (let x = 0; x < grid.size; x++) {
    if (!grid.reserved[y]![x] && test(x, y)) grid.modules[y]![x] = !grid.modules[y]![x];
  }
}

/** The standard's four penalty rules; lower is better. */
export function qrPenalty(m: boolean[][]): number {
  const size = m.length;
  let score = 0;
  const lines: boolean[][] = [...m, ...m[0]!.map((_, x) => m.map((row) => row[x]!))];
  for (const line of lines) {
    let run = 1;
    for (let i = 1; i <= size; i++) {
      if (i < size && line[i] === line[i - 1]) run++;
      else {
        if (run >= 5) score += 3 + (run - 5);
        run = 1;
      }
    }
    const s = line.map((d) => (d ? '1' : '0')).join('');
    for (const p of ['10111010000', '00001011101']) for (let i = s.indexOf(p); i !== -1; i = s.indexOf(p, i + 1)) score += 40;
  }
  for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) {
    const c = m[y]![x];
    if (c === m[y]![x + 1] && c === m[y + 1]![x] && c === m[y + 1]![x + 1]) score += 3;
  }
  const dark = m.reduce((n, row) => n + row.filter(Boolean).length, 0);
  score += Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10;
  return score;
}

const clampVersion = (v: number | undefined, fallback: number) => Math.min(40, Math.max(1, Math.round(v ?? fallback)));

/**
 * Encodes `text` in the smallest version that fits. Throws `QrCodeTooLongError`
 * when it does not fit in `maxVersion` at the requested level.
 */
export function encodeQrCode(text: string, options: QrEncodeOptions = {}): QrCodeMatrix {
  const requested = options.errorCorrection ?? 'M';
  const minVersion = clampVersion(options.minVersion, 1);
  const maxVersion = Math.max(minVersion, clampVersion(options.maxVersion, 40));
  const seg = segment(text);

  let version = minVersion;
  while (version <= maxVersion && segmentBits(seg, version) > qrDataCodewords(version, requested) * 8) version++;
  if (version > maxVersion) throw new QrCodeTooLongError(seg.count, requested, maxVersion);

  let level = requested;
  if (options.boostErrorCorrection) {
    for (const higher of LEVELS.slice(LEVELS.indexOf(requested) + 1)) {
      if (segmentBits(seg, version) <= qrDataCodewords(version, higher) * 8) level = higher;
    }
  }

  const data = codewords(seg, version, level);
  const build = (mask: number) => {
    const grid = new Grid(17 + 4 * version);
    drawFunctionPatterns(grid, version, level);
    drawCodewords(grid, data);
    applyMask(grid, mask);
    drawFormat(grid, level, mask);
    return grid;
  };
  const masks = options.mask === undefined ? [0, 1, 2, 3, 4, 5, 6, 7] : [Math.min(7, Math.max(0, Math.round(options.mask)))];
  let best: { grid: Grid; mask: number; score: number } | null = null;
  for (const mask of masks) {
    const grid = build(mask);
    const score = masks.length > 1 ? qrPenalty(grid.modules) : 0;
    if (!best || score < best.score) best = { grid, mask, score };
  }
  return { version, size: best!.grid.size, modules: best!.grid.modules, errorCorrection: level, mask: best!.mask, mode: seg.mode };
}
