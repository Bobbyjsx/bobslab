"use client";

import * as React from "react";
import { Separator } from "@bobslab/ui";

export function SeparatorDemo() {
  return (
    <div className="w-full my-6 flex flex-col gap-4 max-w-md rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-foreground">
          Bobslab Primitives
        </h4>
        <p className="text-xs text-muted-foreground">
          An open-source UI component library built on Base UI.
        </p>
      </div>

      <Separator />

      <div className="flex h-5 items-center space-x-4 text-xs text-muted-foreground">
        <span className="text-foreground font-medium">Docs</span>
        <Separator orientation="vertical" />
        <span>Source</span>
        <Separator orientation="vertical" />
        <span>Release 0.0.2</span>
      </div>
    </div>
  );
}
