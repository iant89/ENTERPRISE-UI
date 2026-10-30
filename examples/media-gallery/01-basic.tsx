import { MediaGallery } from '@enterprise-ui/react';

export const title = 'Media gallery';
export const description = 'Show one image large and the rest as thumbnails.';

const svg = (fill: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="${fill}"/></svg>`)}`;

export default function MediaGalleryBasic() {
  return (
    <MediaGallery
      aria-label="Product images"
      items={[
        { id: '1', src: svg('#0a6ed1'), alt: 'Pump, front view' },
        { id: '2', src: svg('#5b738b'), alt: 'Pump, side view' },
        { id: '3', src: svg('#e9730c'), alt: 'Pump, label close-up' },
      ]}
    />
  );
}
