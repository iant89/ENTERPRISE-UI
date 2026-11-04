import { LightboxImage, Stack } from '@enterprise-ui/react';

export const title = 'Product images';
export const description = 'Press a thumbnail (marked with the zoom icon) to see the image at its original size. Large images shrink to fit the screen. Close with the Close button, Escape or a click outside. The second image has a broken URL to show the error state.';

// A large (1600 × 1000) generated image, so the example needs no network.
const photo = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a6ed1"/><stop offset="1" stop-color="#5dc8ff"/></linearGradient></defs>' +
    '<rect width="1600" height="1000" fill="url(#g)"/><circle cx="800" cy="500" r="260" fill="#fff" fill-opacity=".85"/>' +
    '<rect x="700" y="420" width="200" height="160" rx="16" fill="#0a6ed1"/><text x="800" y="860" font-family="sans-serif" font-size="64" fill="#fff" text-anchor="middle">Pump P-100</text></svg>',
)}`;

export default function LightboxBasic() {
  return (
    <Stack direction="horizontal" gap={4}>
      <LightboxImage src={photo} title="Pump P-100" subtitle="Hall 3, line B · 1600 × 1000" width={192} height={120} />
      <LightboxImage src="/missing/valve-v-20.jpg" thumbnailSrc={photo} title="Valve V-20" subtitle="Original file is missing" width={192} height={120} />
    </Stack>
  );
}
