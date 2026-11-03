import { DocumentViewer } from '@enterprise-ui/react';

export const title = 'Attachments';
export const description = 'Images can be zoomed and rotated; text files are shown as text. PDFs (`src` ending in .pdf) open in the browser’s own viewer inside a titled frame.';

const scan = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#fff"/><text x="30" y="60" font-family="Arial" font-size="28">Delivery note 80001234</text><text x="30" y="110" font-family="Arial" font-size="18">2 × Valve assembly</text><text x="30" y="140" font-family="Arial" font-size="18">10 × Pressure sensor</text><text x="30" y="360" font-family="Arial" font-size="16">Received by: A. Lindqvist</text></svg>')}`;

export default function DocumentViewerBasic() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <DocumentViewer title="Delivery note 80001234.svg" kind="image" src={scan} alt="Delivery note 80001234 listing 2 valve assemblies and 10 pressure sensors" height="18rem" />
      <DocumentViewer title="EDI message ORDERS.txt" content={'UNH+1+ORDERS:D:96A:UN\nBGM+220+4500017321+9\nDTM+137:20261102:102\nNAD+SU+100045::92'} height="9rem" />
    </div>
  );
}
