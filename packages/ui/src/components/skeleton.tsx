import * as React from "react";
import { cn } from "@bobslab/utils";
import type { HTMLAttributes } from "react";

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("skeleton-shimmer rounded-md bg-muted/70", className)}
      {...props}
    />
  );
}

export { Skeleton };
