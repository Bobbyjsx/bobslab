"use client";

import * as React from "react";
import { Switch } from "@bobslab/ui";

export function SwitchDemo() {
  const [checked, setChecked] = React.useState(true);

  return (
    <div className="w-full my-6 flex flex-col gap-4 max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium text-foreground cursor-pointer">
            Automatic Updates
          </label>
          <p className="text-xs text-muted-foreground">
            Pull latest AI agent skills on startup.
          </p>
        </div>
        <Switch checked={checked} onCheckedChange={setChecked} />
      </div>

      <div className="flex items-center justify-between opacity-50">
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-foreground">
            Strict Telemetry
          </span>
          <p className="text-xs text-muted-foreground">
            Disabled by administrator policy.
          </p>
        </div>
        <Switch disabled checked={false} />
      </div>
    </div>
  );
}
