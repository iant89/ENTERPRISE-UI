/** Barcode formats, named as in the Shape Detection API (`BarcodeDetector`). */
export type BarcodeFormat =
  | 'aztec' | 'codabar' | 'code_39' | 'code_93' | 'code_128' | 'data_matrix'
  | 'ean_8' | 'ean_13' | 'itf' | 'pdf417' | 'qr_code' | 'upc_a' | 'upc_e';

export const allBarcodeFormats: BarcodeFormat[] = ['aztec', 'codabar', 'code_39', 'code_93', 'code_128', 'data_matrix', 'ean_8', 'ean_13', 'itf', 'pdf417', 'qr_code', 'upc_a', 'upc_e'];

export interface BarcodeResult { text: string; format: BarcodeFormat }

/** Decodes one frame; resolves null when no barcode is visible. */
export interface BarcodeDecoder {
  detect(source: HTMLVideoElement): Promise<BarcodeResult | null>;
  /** Which implementation is in use. */
  kind: 'native' | 'zxing' | 'custom';
}

interface NativeDetector { detect(source: CanvasImageSource): Promise<{ rawValue: string; format: string }[]> }
interface NativeDetectorClass { new (options?: { formats: string[] }): NativeDetector; getSupportedFormats?: () => Promise<string[]> }

/** zxing `BarcodeFormat` enum member names for each format. */
export const zxingFormatNames: Record<BarcodeFormat, string> = {
  aztec: 'AZTEC', codabar: 'CODABAR', code_39: 'CODE_39', code_93: 'CODE_93', code_128: 'CODE_128', data_matrix: 'DATA_MATRIX',
  ean_8: 'EAN_8', ean_13: 'EAN_13', itf: 'ITF', pdf417: 'PDF_417', qr_code: 'QR_CODE', upc_a: 'UPC_A', upc_e: 'UPC_E',
};

async function createNativeDecoder(formats: BarcodeFormat[]): Promise<BarcodeDecoder | null> {
  const Detector = (globalThis as { BarcodeDetector?: NativeDetectorClass }).BarcodeDetector;
  if (!Detector) return null;
  try {
    const supported = (await Detector.getSupportedFormats?.()) ?? formats;
    const usable = formats.filter((f) => supported.includes(f));
    if (usable.length < formats.length) return null; // let zxing cover formats the platform lacks
    const detector = new Detector({ formats: usable });
    return {
      kind: 'native',
      async detect(source) {
        const [hit] = await detector.detect(source);
        return hit ? { text: hit.rawValue, format: hit.format as BarcodeFormat } : null;
      },
    };
  } catch {
    return null;
  }
}

/** Lazily loads @zxing/library (Apache-2.0) only when the native detector is unavailable. */
async function createZxingDecoder(formats: BarcodeFormat[]): Promise<BarcodeDecoder> {
  const zx = await import('@zxing/library');
  const reader = new zx.MultiFormatReader();
  const hints = new Map();
  hints.set(zx.DecodeHintType.POSSIBLE_FORMATS, formats.map((f) => zx.BarcodeFormat[zxingFormatNames[f] as keyof typeof zx.BarcodeFormat]));
  hints.set(zx.DecodeHintType.TRY_HARDER, true);
  reader.setHints(hints);
  const byEnum = new Map<number, BarcodeFormat>(formats.map((f) => [zx.BarcodeFormat[zxingFormatNames[f] as keyof typeof zx.BarcodeFormat] as number, f]));
  const canvas = document.createElement('canvas');
  return {
    kind: 'zxing',
    async detect(video) {
      const width = video.videoWidth; const height = video.videoHeight;
      if (!width || !height) return null;
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, width, height);
      const { data } = ctx.getImageData(0, 0, width, height);
      const luminance = new Uint8ClampedArray(width * height);
      for (let i = 0, j = 0; i < data.length; i += 4, j++) luminance[j] = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
      try {
        const result = reader.decodeWithState(new zx.BinaryBitmap(new zx.HybridBinarizer(new zx.RGBLuminanceSource(luminance, width, height))));
        return { text: result.getText(), format: byEnum.get(result.getBarcodeFormat()) ?? formats[0] };
      } catch (error) {
        if (error instanceof zx.NotFoundException || error instanceof zx.ChecksumException || error instanceof zx.FormatException) return null;
        throw error;
      }
    },
  };
}

/** Native `BarcodeDetector` when it supports every requested format, otherwise the lazily loaded zxing decoder. */
export async function createDefaultBarcodeDecoder(formats: BarcodeFormat[]): Promise<BarcodeDecoder> {
  return (await createNativeDecoder(formats)) ?? createZxingDecoder(formats);
}
