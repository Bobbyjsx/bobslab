"use client";

import * as React from "react";
import { THEME_COLORS, RADII, BREAKPOINTS } from "@bobslab/config";

export function ConfigDemo() {
  return (
    <div className="w-full my-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Design Tokens: CSS Variables
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(THEME_COLORS).map(([name, cssVar]) => (
            <div
              key={name}
              className="flex items-center gap-2 p-2 rounded-xl border border-border/70 bg-card text-xs"
            >
              <div
                className="size-5 rounded border border-border shrink-0"
                style={{ backgroundColor: cssVar }}
              />
              <div className="truncate">
                <div className="font-semibold text-foreground truncate">
                  {name}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground truncate">
                  {cssVar}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/60 pt-4 text-xs">
        <div>
          <span className="font-semibold text-foreground">Standard Radii:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(RADII).map(([key, val]) => (
              <span
                key={key}
                className="px-2 py-1 rounded-md bg-muted text-muted-foreground font-mono text-[11px]"
              >
                {key}: {val}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="font-semibold text-foreground">
            Responsive Breakpoints:
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(BREAKPOINTS).map(([key, val]) => (
              <span
                key={key}
                className="px-2 py-1 rounded-md bg-muted text-muted-foreground font-mono text-[11px]"
              >
                {key}: {val}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
