"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Button,
} from "@bobslab/ui";

export function TooltipDemo() {
  return (
    <TooltipProvider>
      <div className="w-full my-6 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-background p-6 shadow-xs">
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="outline">Hover over me</Button>}
          />
          <TooltipContent>
            <span>Keyboard shortcut: ⌘+K</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button size="sm" variant="secondary">
                Information
              </Button>
            }
          />
          <TooltipContent sideOffset={6}>
            <span>Changes are synced instantly</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
