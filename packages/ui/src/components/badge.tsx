import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@bobslab/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground border-border",
        success:
          "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
        warning:
          "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
        info: "bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
        danger:
          "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
        neutral:
          "bg-slate-50 text-slate-700 dark:bg-zinc-900 dark:text-zinc-300 border-slate-200 dark:border-zinc-800",
        tier: "bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800/60 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeStatus =
  | "completed"
  | "processing"
  | "pending"
  | "authorized"
  | "failed"
  | "cancelled";

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  status?: BadgeStatus;
}

export function Badge({
  className,
  variant,
  status,
  children,
  ...props
}: BadgeProps) {
  let resolvedVariant = variant || "default";

  if (status) {
    switch (status) {
      case "completed":
        resolvedVariant = "success";
        break;
      case "processing":
        resolvedVariant = "warning";
        break;
      case "pending":
      case "authorized":
        resolvedVariant = "info";
        break;
      case "failed":
      case "cancelled":
        resolvedVariant = "danger";
        break;
    }
  }

  return (
    <span
      className={cn(badgeVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      {status === "completed" && (
        <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
      )}
      {status === "processing" && (
        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
      )}
      {(status === "pending" || status === "authorized") && (
        <span className="size-1.5 rounded-full bg-blue-500" />
      )}
      {(status === "failed" || status === "cancelled") && (
        <span className="size-1.5 rounded-full bg-rose-500" />
      )}
      {children}
    </span>
  );
}
