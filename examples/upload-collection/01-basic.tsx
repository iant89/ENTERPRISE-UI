import { useState } from 'react';
import { UploadCollection, type UploadCollectionItem } from '@enterprise-ui/react';

export const title = 'Upload collection';
export const description = 'Drop or choose files; the application uploads them and updates the list.';

export default function UploadCollectionBasic() {
  const [items, setItems] = useState<UploadCollectionItem[]>([
    { id: '1', fileName: 'Invoice-4500012.pdf', size: 184320 },
    { id: '2', fileName: 'Delivery-note.png', size: 920000, status: 'uploading', progress: 60 },
  ]);
  return (
    <UploadCollection
      title="Attachments"
      items={items}
      onFilesSelected={(files) => setItems((all) => [...all, ...files.map((f, i) => ({ id: `${Date.now()}-${i}`, fileName: f.name, size: f.size }))])}
      onItemDelete={(id) => setItems((all) => all.filter((i) => i.id !== id))}
    />
  );
}
