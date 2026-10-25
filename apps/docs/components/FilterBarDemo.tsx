"use client";

import * as React from "react";
import { TableFilterBar, TableSearchInput, Button } from "@bobslab/ui";

export function FilterBarDemo() {
  const [search, setSearch] = React.useState("");

  return (
    <div className="w-full my-6 flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <TableFilterBar>
        <TableSearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Filter components..."
        />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            Export CSV
          </Button>
          <Button size="sm">Add Item</Button>
        </div>
      </TableFilterBar>

      <div className="text-xs text-muted-foreground">
        Current query:{" "}
        <span className="font-semibold text-foreground">
          {search ? `"${search}"` : "None"}
        </span>
      </div>
    </div>
  );
}
