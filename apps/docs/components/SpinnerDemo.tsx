"use client";

import * as React from "react";
import { Spinner } from "@bobslab/ui";

export function SpinnerDemo() {
  return (
    <div className="w-full my-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Sizes
        </div>
        <div className="flex items-center gap-6 text-foreground">
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <span className="text-xs text-muted-foreground">Small (14px)</span>
          </div>
          <div className="flex items-center gap-2">
            <Spinner size="md" />
            <span className="text-xs text-muted-foreground">Medium (18px)</span>
          </div>
          <div className="flex items-center gap-2">
            <Spinner size="lg" />
            <span className="text-xs text-muted-foreground">Large (24px)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
