"use client";

import * as React from "react";
import * as Icons from "@bobslab/icons";
import { useClipboard } from "@bobslab/hooks";

export function IconsDemo() {
  const [search, setSearch] = React.useState("");
  const [size, setSize] = React.useState<number>(22);
  const { copied, copy } = useClipboard({ timeout: 1500 });
  const [copiedName, setCopiedName] = React.useState<string | null>(null);

  const iconEntries = Object.entries(Icons).filter(
    ([name, component]) =>
      typeof component === "function" &&
      name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCopy = (name: string) => {
    copy(`<${name} size={${size}} />`);
    setCopiedName(name);
  };

  return (
    <div className="w-full my-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons..."
          className="rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary w-48"
        />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Size:</span>
          {[16, 20, 24, 32].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                size === s
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {s}px
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {iconEntries.map(([name, IconComponent]) => {
          const isCopied = copied && copiedName === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => handleCopy(name)}
              className="group flex flex-col items-center justify-center p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer text-foreground relative"
              title={`Click to copy <${name} />`}
            >
              <div className="size-10 flex items-center justify-center text-foreground group-hover:scale-110 transition-transform">
                <IconComponent size={size} />
              </div>
              <span className="text-[11px] font-mono mt-2 text-muted-foreground group-hover:text-foreground truncate w-full text-center">
                {name}
              </span>
              {isCopied && (
                <span className="absolute inset-0 bg-primary/95 text-primary-foreground text-xs font-semibold rounded-xl flex items-center justify-center animate-in fade-in-0">
                  Copied!
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Showing {iconEntries.length} icons. Click any icon to copy its JSX
        snippet.
      </div>
    </div>
  );
}
