"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@bobslab/ui";

export function SelectDemo() {
  const [val, setVal] = React.useState<string | null>("ui");

  return (
    <div className="w-full my-6 flex flex-col gap-4 max-w-xs rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Select Package
      </div>
      <Select value={val} onValueChange={(nextVal) => setVal(nextVal)}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a package" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ui">@bobslab/ui</SelectItem>
          <SelectItem value="icons">@bobslab/icons</SelectItem>
          <SelectItem value="hooks">@bobslab/hooks</SelectItem>
          <SelectItem value="utils">@bobslab/utils</SelectItem>
          <SelectItem value="cli">@bobslab/cli</SelectItem>
        </SelectContent>
      </Select>
      <div className="text-xs text-muted-foreground">
        Selected: <code className="font-mono text-foreground">{val}</code>
      </div>
    </div>
  );
}
