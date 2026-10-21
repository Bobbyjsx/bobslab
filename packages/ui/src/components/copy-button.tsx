import * as React from "react";
import { cn } from "@bobslab/utils";
import { useClipboard } from "@bobslab/hooks";
import { CheckIcon, CopyIcon } from "@bobslab/icons";

export interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  timeout?: number;
}

export function CopyButton({
  value,
  timeout = 2000,
  className,
  ...props
}: CopyButtonProps) {
  const { copied, copy } = useClipboard({ timeout });

  return (
    <button
      type="button"
      onClick={() => copy(value)}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={cn(
        "inline-flex items-center justify-center size-8 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50",
        copied && "border-emerald-500 text-emerald-600 dark:text-emerald-400",
        className,
      )}
      {...props}
    >
      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
    </button>
  );
}
