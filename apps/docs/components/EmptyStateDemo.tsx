"use client";

import * as React from "react";
import { EmptyState, Button } from "@bobslab/ui";
import { SearchIcon } from "@bobslab/icons";

export function EmptyStateDemo() {
  return (
    <div className="w-full my-6 flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <EmptyState
        icon={<SearchIcon size={22} />}
        title="No packages found"
        description="Try adjusting your search criteria or clear your current filters to view available components."
        action={
          <Button size="sm" variant="outline">
            Clear Filters
          </Button>
        }
      />
    </div>
  );
}
