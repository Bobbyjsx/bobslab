"use client";

import * as React from "react";
import { Input } from "@bobslab/ui";
import { SearchIcon } from "@bobslab/icons";

export function InputDemo() {
  const [val, setVal] = React.useState("");

  return (
    <div className="w-full my-6 flex flex-col gap-5 max-w-md rounded-2xl border border-border bg-background p-6 shadow-xs">
      <Input
        label="Username"
        placeholder="Enter your handle"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        helpText="This will be displayed on your public profile."
      />

      <Input
        label="Search Packages"
        placeholder="e.g. @bobslab/ui"
        leftNode={<SearchIcon size={16} />}
      />

      <Input
        label="API Endpoint"
        defaultValue="invalid-url-format"
        error="Please provide a valid https:// endpoint URL."
      />

      <Input label="Disabled Token" defaultValue="tok_live_8912..." disabled />
    </div>
  );
}
