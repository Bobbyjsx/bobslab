"use client";

import * as React from "react";
import { Badge } from "@bobslab/ui";

export function BadgeDemo() {
  return (
    <div className="w-full my-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Status Badges (with status indicators)
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge status="completed">Completed</Badge>
          <Badge status="processing">Processing</Badge>
          <Badge status="pending">Pending</Badge>
          <Badge status="authorized">Authorized</Badge>
          <Badge status="failed">Failed</Badge>
          <Badge status="cancelled">Cancelled</Badge>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Semantic Variants
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="tier">Tier Pro</Badge>
        </div>
      </div>
    </div>
  );
}
