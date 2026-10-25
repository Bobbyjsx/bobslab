"use client";

import * as React from "react";
import {
  useCountdown,
  useDebounce,
  useClipboard,
  useLocalStorage,
  useIsMobile,
} from "@bobslab/hooks";
import { Button } from "@bobslab/ui";

export function HooksDemo() {
  // 1. useDebounce
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 500);

  // 2. useCountdown
  const { countdown, isRunning, start, reset } = useCountdown({
    seconds: 30,
    autoStart: false,
  });

  // 3. useClipboard
  const { copied, copy } = useClipboard({ timeout: 2000 });

  // 4. useLocalStorage
  const [themePreference, setThemePreference] = useLocalStorage(
    "bobslab-demo-theme",
    "dark",
  );

  // 5. useIsMobile
  const isMobile = useIsMobile(768);

  return (
    <div className="w-full my-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* useDebounce */}
        <div className="flex flex-col gap-2 rounded-xl border border-border p-4 bg-muted/20">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            useDebounce(val, 500ms)
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type quickly..."
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Debounced Value:{" "}
            <span className="font-mono font-semibold text-foreground">
              {debouncedQuery || "(empty)"}
            </span>
          </div>
        </div>

        {/* useCountdown */}
        <div className="flex flex-col gap-2 rounded-xl border border-border p-4 bg-muted/20">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            useCountdown(30s)
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold text-foreground">
              00:{countdown < 10 ? `0${countdown}` : countdown}
            </span>
            <Button
              size="xs"
              variant={isRunning ? "outline" : "default"}
              onClick={() => (isRunning ? reset() : start())}
            >
              {isRunning ? "Reset" : "Start Timer"}
            </Button>
          </div>
        </div>

        {/* useClipboard */}
        <div className="flex flex-col gap-2 rounded-xl border border-border p-4 bg-muted/20">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            useClipboard()
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value="https://bobslab.vercel.app"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono text-muted-foreground"
            />
            <Button
              size="xs"
              onClick={() => copy("https://bobslab.vercel.app")}
            >
              {copied ? "Copied!" : "Copy URL"}
            </Button>
          </div>
        </div>

        {/* useLocalStorage & useIsMobile */}
        <div className="flex flex-col gap-2 rounded-xl border border-border p-4 bg-muted/20">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            useLocalStorage & useIsMobile
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Stored Preference:</span>
            <button
              type="button"
              onClick={() =>
                setThemePreference(
                  themePreference === "dark" ? "light" : "dark",
                )
              }
              className="font-mono font-semibold text-primary underline cursor-pointer"
            >
              {themePreference} (Click to toggle)
            </button>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-muted-foreground">Viewport (&lt;768px):</span>
            <span className="font-semibold text-foreground">
              {isMobile ? "Mobile Device" : "Desktop / Tablet"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
