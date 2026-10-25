"use client";

import * as React from "react";
import { Textarea } from "@bobslab/ui";

export function TextareaDemo() {
  const [bio, setBio] = React.useState("");

  return (
    <div className="w-full my-6 flex flex-col gap-5 max-w-md rounded-2xl border border-border bg-background p-6 shadow-xs">
      <Textarea
        label="Project Description"
        placeholder="Briefly describe your design system or application..."
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        helpText="Max 250 characters."
      />

      <Textarea
        label="Commit Note"
        defaultValue="WIP: missing test suite"
        error="Commit message cannot start with WIP in production branches."
      />
    </div>
  );
}
