import * as React from "react";
import { cn } from "@bobslab/utils";
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from "@bobslab/icons";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm border-collapse", className)}
        {...props}
      />
    </div>
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-medium text-xs sm:text-sm select-none",
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-slate-100 dark:divide-zinc-800/70 [&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected = false, ...props }, ref) => (
    <tr
      ref={ref}
      data-state={selected ? "selected" : undefined}
      className={cn(
        "transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-900/40",
        selected && "bg-blue-50/70 dark:bg-blue-950/25 hover:bg-blue-50/90 dark:hover:bg-blue-950/40",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  isSorted?: "asc" | "desc" | boolean | null;
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, isSorted, onSort, ...props }, ref) => {
    return (
      <th
        ref={ref}
        onClick={onSort}
        className={cn(
          "h-11 px-4 text-left align-middle font-medium text-slate-600 dark:text-zinc-300 text-xs sm:text-sm tracking-tight",
          onSort && "cursor-pointer hover:text-slate-900 dark:hover:text-white select-none",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-1.5">
          <span>{children}</span>
          {onSort && (
            <span className="shrink-0 text-slate-400 dark:text-zinc-500">
              {isSorted === "asc" ? (
                <ChevronUpIcon size={14} />
              ) : isSorted === "desc" ? (
                <ChevronDownIcon size={14} />
              ) : (
                <ChevronsUpDownIcon size={14} />
              )}
            </span>
          )}
        </div>
      </th>
    );
  },
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-3.5 align-middle text-sm text-slate-800 dark:text-zinc-200",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-xs text-slate-500 dark:text-zinc-400", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export interface TableCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function TableCheckbox({
  className,
  checked = false,
  indeterminate = false,
  onCheckedChange,
  ...props
}: TableCheckboxProps) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={cn(
        "size-4 rounded-md border-slate-300 dark:border-zinc-700 text-primary focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 cursor-pointer accent-primary",
        className,
      )}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
