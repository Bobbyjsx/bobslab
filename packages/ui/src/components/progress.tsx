"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "@bobslab/utils";

function Progress({
  className,
  value,
  max = 100,
  ...props
}: ProgressPrimitive.Root.Props & { value?: number; max?: number }) {
  const percentage = value != null ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={max}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
