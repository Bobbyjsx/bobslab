"use client";

import * as React from "react";
import { Skeleton } from "@bobslab/ui";

export function SkeletonDemo() {
  return (
    <div className="w-full my-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Card Loading State
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
  );
}
