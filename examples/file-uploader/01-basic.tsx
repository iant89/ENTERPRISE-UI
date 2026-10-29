import { FileUploader } from '@enterprise-ui/react';
export default function FileUploaderExample() {
  return <FileUploader accept={['.txt']} maxFileSize={1000000} upload={async (_file, { signal, onProgress }) => {
    if (signal.aborted) throw new Error('Cancelled');
    onProgress(1);
  }} />;
}
