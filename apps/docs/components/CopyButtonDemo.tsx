"use client";

import * as React from "react";
import { CopyButton } from "@bobslab/ui";

export function CopyButtonDemo() {
  const installCmd = "pnpm add @bobslab/ui";

  return (
    <div className="w-full my-6 flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Interactive Clipboard Copy
      </div>
      <div className="flex items-center justify-between max-w-md rounded-xl border border-border bg-muted/40 px-4 py-2.5">
        <code className="text-sm font-mono text-foreground">{installCmd}</code>
        <CopyButton value={installCmd} />
      </div>
    </div>
  );
}
