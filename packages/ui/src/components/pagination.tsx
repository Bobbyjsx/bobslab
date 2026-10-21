import * as React from "react";
import { cn } from "@bobslab/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@bobslab/icons";

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  pageIndex: number;
  pageCount: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  canPreviousPage?: boolean;
  canNextPage?: boolean;
  onPageChange: (newPageIndex: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  maxPageButtons?: number;
}

export function Pagination({
  className,
  pageIndex,
  pageCount,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50],
  canPreviousPage = pageIndex > 0,
  canNextPage = pageIndex < pageCount - 1,
  onPageChange,
  onPageSizeChange,
  maxPageButtons = 5,
  ...props
}: PaginationProps) {
  const renderPageButtons = () => {
    if (pageCount <= 1) return null;

    const pages: (number | "ellipsis")[] = [];
    const halfMax = Math.floor(maxPageButtons / 2);
    let startPage = Math.max(pageIndex - halfMax, 0);
    let endPage = Math.min(startPage + maxPageButtons - 1, pageCount - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(endPage - maxPageButtons + 1, 0);
    }

    if (startPage > 0) {
      pages.push(0);
      if (startPage > 1) {
        pages.push("ellipsis");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < pageCount - 1) {
      if (endPage < pageCount - 2) {
        pages.push("ellipsis");
      }
      pages.push(pageCount - 1);
    }

    return (
      <div className="flex items-center gap-1">
        {pages.map((item, idx) => {
          if (item === "ellipsis") {
            return (
              <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 select-none">
                …
              </span>
            );
          }

          const isActive = item === pageIndex;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={cn(
                "h-8 min-w-8 px-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80 bg-white dark:bg-zinc-900",
              )}
            >
              {item + 1}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 select-none",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {typeof totalItems === "number" && (
          <span>
            Total record: <strong className="font-semibold text-slate-900 dark:text-white">{totalItems}</strong>
          </span>
        )}

        {pageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!canPreviousPage}
          aria-label="Previous page"
          className="size-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <ChevronLeftIcon size={14} />
        </button>

        {renderPageButtons()}

        {pageCount > 0 && !maxPageButtons && (
          <span className="text-xs text-slate-600 dark:text-zinc-400">
            {pageIndex + 1} to {pageCount}
          </span>
        )}

        <button
          type="button"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNextPage}
          aria-label="Next page"
          className="size-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <ChevronRightIcon size={14} />
        </button>
      </div>
    </div>
  );
}
