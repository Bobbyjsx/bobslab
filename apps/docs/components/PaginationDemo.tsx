"use client";

import * as React from "react";
import { Pagination } from "@bobslab/ui";

export function PaginationDemo() {
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  return (
    <div className="w-full my-6 flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Interactive Pagination Controls
      </div>
      <Pagination
        pageIndex={page}
        pageCount={10}
        totalItems={100}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      <div className="text-xs text-muted-foreground">
        Active page:{" "}
        <span className="font-semibold text-foreground">{page + 1}</span> of 10
        (Showing {pageSize} items per page)
      </div>
    </div>
  );
}
