import { useState } from 'react';
import { Pagination, Stack } from '@enterprise-ui/react';

export const title = 'Pagination';
export const description = 'Shows a range summary, page numbers with ellipses and an optional page-size selector. On phones it condenses to “Page X of Y”.';

export default function PaginationBasic() {
  const [page, setPage] = useState(4);
  const [pageSize, setPageSize] = useState(25);
  return (
    <Stack gap={6}>
      <Pagination page={page} onPageChange={setPage} totalItems={1243} pageSize={pageSize} pageSizeOptions={[25, 50, 100]} onPageSizeChange={setPageSize} />
      <Pagination aria-label="Compact pagination" page={1} onPageChange={() => {}} totalItems={42} pageSize={10} showFirstLast={false} />
    </Stack>
  );
}
