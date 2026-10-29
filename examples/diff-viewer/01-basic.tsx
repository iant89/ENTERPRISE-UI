import { DiffViewer, compareDiffValues } from '@enterprise-ui/react';
const changes = compareDiffValues({ status: 'Draft', supplier: { name: 'Acme' }, obsolete: true }, { status: 'Approved', supplier: { name: 'Acme' }, approvedBy: 'Lee' });
export default function DiffExample() { return <DiffViewer title="Purchase order changes" changes={changes} />; }
