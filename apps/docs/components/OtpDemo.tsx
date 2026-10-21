"use client";

import * as React from "react";
import { OtpInput } from "@bobslab/ui";

export function OtpDemo() {
  const [code, setCode] = React.useState("42");

  return (
    <div className="w-full my-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Interactive 6-Digit OTP Verification
      </div>
      <div className="flex flex-col gap-4">
        <OtpInput value={code} length={6} onChange={setCode} />
        <div className="text-xs text-muted-foreground">
          Current value: <span className="font-mono font-semibold text-foreground">{code || "(empty)"}</span>
        </div>
      </div>
    </div>
  );
}
