"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@bobslab/ui";

export function TabsDemo() {
  return (
    <div className="w-full my-6 flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <Tabs defaultValue="pnpm">
        <TabsList>
          <TabsTrigger value="pnpm">pnpm</TabsTrigger>
          <TabsTrigger value="npm">npm</TabsTrigger>
          <TabsTrigger value="yarn">yarn</TabsTrigger>
          <TabsTrigger value="bun">bun</TabsTrigger>
        </TabsList>
        <TabsContent value="pnpm">
          <div className="rounded-xl border border-border bg-muted/30 p-4 font-mono text-xs">
            pnpm add @bobslab/ui @bobslab/icons
          </div>
        </TabsContent>
        <TabsContent value="npm">
          <div className="rounded-xl border border-border bg-muted/30 p-4 font-mono text-xs">
            npm install @bobslab/ui @bobslab/icons
          </div>
        </TabsContent>
        <TabsContent value="yarn">
          <div className="rounded-xl border border-border bg-muted/30 p-4 font-mono text-xs">
            yarn add @bobslab/ui @bobslab/icons
          </div>
        </TabsContent>
        <TabsContent value="bun">
          <div className="rounded-xl border border-border bg-muted/30 p-4 font-mono text-xs">
            bun add @bobslab/ui @bobslab/icons
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
