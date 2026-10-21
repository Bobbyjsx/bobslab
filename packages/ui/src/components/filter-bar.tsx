import * as React from "react";
import { cn } from "@bobslab/utils";
import { CloseIcon, SearchIcon } from "@bobslab/icons";

export function TableFilterBar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 mb-4 select-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TableSearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function TableSearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className,
  ...props
}: TableSearchInputProps) {
  return (
    <div className={cn("relative flex items-center min-w-64 max-w-sm", className)}>
      <SearchIcon
        size={15}
        className="absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-2xs"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            onClear?.();
          }}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
        >
          <CloseIcon size={13} />
        </button>
      )}
    </div>
  );
}

export interface TableFilterChipProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  value?: string;
  onRemove?: () => void;
}

export function TableFilterChip({
  label,
  value,
  onRemove,
  className,
  ...props
}: TableFilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-700 dark:text-zinc-300 shadow-2xs",
        className,
      )}
      {...props}
    >
      <span className="text-slate-400 dark:text-zinc-500">{label}:</span>
      {value && <strong className="font-medium text-slate-900 dark:text-white">{value}</strong>}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
        >
          <CloseIcon size={12} />
        </button>
      )}
    </span>
  );
}
