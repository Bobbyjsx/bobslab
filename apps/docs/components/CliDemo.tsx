"use client";

import * as React from "react";
import { Button } from "@bobslab/ui";

export function CliDemo() {
  const [activeTab, setActiveTab] = React.useState<"skills" | "config">(
    "skills",
  );

  return (
    <div className="w-full my-6 flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Button
          size="xs"
          variant={activeTab === "skills" ? "default" : "outline"}
          onClick={() => setActiveTab("skills")}
        >
          skills pull
        </Button>
        <Button
          size="xs"
          variant={activeTab === "config" ? "default" : "outline"}
          onClick={() => setActiveTab("config")}
        >
          config pull
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-slate-950 p-4 font-mono text-xs text-slate-100 dark:bg-black shadow-inner overflow-x-auto">
        {activeTab === "skills" ? (
          <div className="space-y-2">
            <div className="text-slate-400">
              $ npx bobs-lab skills pull @frontend
            </div>
            <div className="text-emerald-400">
              ✔ Discovered 4 skills in bundle @frontend:
            </div>
            <div className="pl-4 space-y-1 text-slate-300">
              <div>
                → create-component (dual-layer primitives + high-level entry)
              </div>
              <div>→ component-implementation (accessibility + test-first)</div>
              <div>→ docs-writing (mandatory live output verification)</div>
              <div>→ bug-fixing (repro, diagnose, isolate, fix)</div>
            </div>
            <div className="text-emerald-400">
              ✔ Synchronized skills into .agents/skills/
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-slate-400">$ npx bobs-lab config pull zed</div>
            <div className="text-emerald-400">
              ✔ Fetched canonical toolchain configuration for Zed
            </div>
            <div className="pl-4 space-y-1 text-slate-300">
              <div>
                → Created .zed/settings.json (Tailwind v4, Biome, Vitest runner)
              </div>
            </div>
            <div className="text-emerald-400">
              ✔ Config sync completed successfully!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
