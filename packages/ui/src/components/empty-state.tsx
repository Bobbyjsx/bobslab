import * as React from "react";
import { cn } from "@bobslab/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-background/50",
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 size-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <h4 className="text-base font-semibold tracking-tight text-foreground">{title}</h4>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
