---
name: docs-writing
description: Use when authoring, updating, or reviewing documentation in Bobslab — enforces the mandatory rule that every feature or component demoed in the docs MUST show the actual rendered output/preview of what is being demoed, not just static code snippets.
tags: [frontend, docs, mdx]
version: 1.0.0
---

# Documentation Writing in Bobslab

## Core Philosophy

Documentation in Bobslab is experiential and visual. Developers should see the rendered component in action before copying code snippets.

> [!IMPORTANT]
> **MANDATORY RULE:**
> You MUST show the output of whatever is being demoed in the docs.
> Simply writing a markdown code block `tsx ... ` without rendering its visual output is considered incomplete documentation. Every demoed component, variant, or state must have a corresponding live rendered preview.

---

## Architecture of a Documentation Page

Every component documentation page in `apps/docs/app/<component>/page.mdx` must contain:

1. **Title and Value Proposition**: High-level summary of what the component does and its foundational primitives (e.g. Base UI).
2. **Interactive Preview**: A client-rendered component from `apps/docs/components/<Component>Demo.tsx` mounted directly in MDX showing the live component output.
3. **Usage Code Examples**:
   - High-Level Entry Component usage (concise, zero-boilerplate).
   - Fine-Grained Primitives usage (for advanced slot & styling control).
4. **Comprehensive Props Table**: Markdown table listing every prop, type, default, and behavior description.

---

## Pattern: Creating the Client Demo Component

Create `apps/docs/components/<Component>Demo.tsx`:

```tsx
"use client";

import * as React from "react";
import { Button, Dialog, Badge } from "@bobslab/ui";

export function ComponentDemo() {
  const [active, setActive] = React.useState(false);

  return (
    <div className="w-full my-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Live Interactive Preview
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {/* Real rendered output */}
      </div>
    </div>
  );
}
```

---

## Pattern: MDX Embedding

In `apps/docs/app/<component>/page.mdx`:

````mdx
# Button

Primary interactive element supporting 6 variants and loading state.

import { ButtonDemo } from "@/components/ButtonDemo";

## Interactive Preview

<ButtonDemo />

## Usage

```tsx
import { Button } from "@bobslab/ui";

export function Example() {
  return <Button variant="default">Click Me</Button>;
}
```
````

```

---

## Quality Checklist for Docs

- [ ] Does the page render the live output of what is being demoed?
- [ ] Are all key states shown visually (default, variants, sizes, disabled, loading)?
- [ ] Is interactive state functional (clicks, toggles, dialog opens, tabs switch)?
- [ ] Does `apps/docs` build cleanly with `pnpm --filter docs run build` without hydration mismatches or missing imports?
```
