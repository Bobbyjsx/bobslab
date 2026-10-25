"use client";

import * as React from "react";
import { Banner, Button } from "@bobslab/ui";

export function BannerDemo() {
  const [showWarning, setShowWarning] = React.useState(true);

  return (
    <div className="w-full my-6 flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <Banner
        intent="info"
        title="Scheduled Maintenance"
        description="Our API cluster will undergo scheduled maintenance tonight at 02:00 UTC."
      />

      <Banner
        intent="success"
        title="Deployment Complete"
        description="Version 0.0.2 is live and all edge caches have been warmed."
      />

      {showWarning ? (
        <Banner
          intent="warning"
          title="Rate Limit Approaching"
          description="You have used 85% of your quota for this billing cycle."
          showCloseButton
          onClose={() => setShowWarning(false)}
        />
      ) : (
        <div className="text-xs text-muted-foreground italic flex items-center gap-2">
          <span>Dismissed warning banner.</span>
          <button
            type="button"
            onClick={() => setShowWarning(true)}
            className="text-primary underline font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>
      )}

      <Banner
        intent="danger"
        title="Authentication Expired"
        description="Your refresh token has expired. Please log in again to continue."
        action={
          <Button size="xs" variant="destructive">
            Re-authenticate
          </Button>
        }
      />
    </div>
  );
}
