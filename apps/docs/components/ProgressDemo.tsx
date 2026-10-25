"use client";

import * as React from "react";
import { Progress, Button } from "@bobslab/ui";

export function ProgressDemo() {
  const [value, setValue] = React.useState(45);

  return (
    <div className="w-full my-6 flex flex-col gap-4 max-w-md rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
        <span>Upload Progress</span>
        <span className="font-semibold text-foreground">{value}%</span>
      </div>

      <Progress value={value} max={100} />

      <div className="flex items-center gap-2 pt-2">
        <Button
          size="xs"
          variant="outline"
          onClick={() => setValue((prev) => Math.max(prev - 15, 0))}
        >
          -15%
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => setValue((prev) => Math.min(prev + 15, 100))}
        >
          +15%
        </Button>
        <Button size="xs" variant="ghost" onClick={() => setValue(0)}>
          Reset
        </Button>
      </div>
    </div>
  );
}
