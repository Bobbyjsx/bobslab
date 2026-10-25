"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent, Button } from "@bobslab/ui";

export function PopoverDemo() {
  return (
    <div className="w-full my-6 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <Popover>
        <PopoverTrigger
          render={<Button variant="outline">Open Popover</Button>}
        />
        <PopoverContent>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm leading-none">Dimensions</h4>
            <p className="text-xs text-muted-foreground">
              Set the width and max-height for this layer container.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="rounded border border-border p-2 bg-muted/30">
                Width: 320px
              </div>
              <div className="rounded border border-border p-2 bg-muted/30">
                Height: Auto
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
