---
name: create-component
description: Use when adding a new component to the Bobslab component library, or extending/documenting an existing one — covers library source, dual-layer API (primitives + single entry component), package export, docs interactive demo with live rendered output, MDX page, sidebar registration, and build verification. Triggers on "add a component", "create a new component", "scaffold a component for Bobslab", or requests to document/export an existing undocumented component.
tags: [frontend, component, ui]
version: 1.0.0
---

# Create a Bobslab Component

Scaffolds a component following Bobslab's strict architectural standards:

1. **Dual-Layer Component Design**: Always export headless/fine-grained primitives, BUT also build and export one high-level entry component that can be used out-of-the-box without primitives if fine-grained UI is not needed.
2. **Mandatory Live Output in Docs**: In documentation writing, you MUST show the rendered output of whatever is being demoed, alongside the code block.
3. **Canonical Reference**: Check `Dialog`, `Tabs`, and `Table` in `@bobslab/ui` and `apps/docs`.

---

## 0. Discovery (Mandatory — Do this first)

Before writing any new component, verify whether the component or a primitive close enough to compose/extend already exists:

- `packages/ui/src/components/` — existing components and primitives.
- `apps/docs/app/` — already-documented components and demos.
- Check Base UI (`@base-ui/react`) / Radix primitives.

Prefer composing existing primitives over writing raw HTML or duplicating logic.

---

## 1. Library Component Architecture

`packages/ui/src/components/<kebab-name>.tsx`

### Dual-Layer API Rules:

#### Layer 1: Primitives (Fine-Grained Control)

Export every sub-component so consumers with custom layouts, custom slots, or headless styling needs can assemble the pieces manually:

- e.g., for Dialog: `DialogRoot`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`.
- e.g., for Tabs: `TabsRoot`, `TabsList`, `TabsTrigger`, `TabsContent`.

#### Layer 2: Single Entry Component (Direct / Ergonomic Usage)

Export a primary component (matching the feature name, e.g. `Dialog`, `Tabs`, `Select`) that works immediately without assembling primitives:

- Takes high-level props: `trigger`, `title`, `description`, `footer`, `items`, `children`.
- Renders the underlying primitives automatically if high-level props are provided.
- Passes children directly to the root if primitives are composed manually inside it.

### Code Conventions:

- `"use client";` as the first line if the component uses hooks, DOM listeners, or browser APIs.
- Variant & size props → `cva` from `class-variance-authority`.
- Class merging → `cn` from `@bobslab/utils`, never raw template string concatenation.
- Expose DOM refs with `React.forwardRef` where DOM measurement or focus management is needed.
- Export `<ComponentName>Props` and all relevant sub-component props.
- Set `<ComponentName>.displayName = "<ComponentName>"`.
- **Anti-Slop Standards (`antislop-code`)**:
  - No decorative separators (`// =====`), banners, or emoji (`🚀`, `✅`).
  - No restating the obvious (`// Render button` above return statement).
  - No workflow narration (`// Step 1...`, `// Step 2...`).
  - Comments must only explain non-obvious intent, contracts, or platform workarounds (1-2 lines max).

---

## 2. Package Export

In `packages/ui/src/index.ts`:
Export both the single entry component, all primitives, and all supporting types:

```ts
export {
  ComponentName,
  ComponentNameRoot,
  ComponentNameTrigger,
  ComponentNameContent,
  // ... other primitives
} from "./components/component-name";
export type {
  ComponentNameProps,
  // ... supporting types
} from "./components/component-name";
```

---

## 3. Docs Interactive Demo Component (Live Output Required)

`apps/docs/components/<ComponentName>Demo.tsx`

> [!IMPORTANT]
> **MANDATORY RULE**: In docs writing, you MUST show the live rendered output of whatever is being demoed in the docs. Static code blocks without a rendered preview are strictly prohibited for UI components.

- `"use client";` as first line.
- Import the component from `@bobslab/ui`.
- Render a live, interactive, realistic example showing the component in action (with interactive state, buttons, badges, or inputs).
- Wrap in a clean preview container:
  ```tsx
  export function ComponentNameDemo() {
    return (
      <div className="flex flex-wrap items-center gap-4 p-6 rounded-2xl border border-border bg-background my-4">
        {/* Live component output */}
      </div>
    );
  }
  ```

---

## 4. MDX Documentation Page

`apps/docs/app/<component-name>/page.mdx`

Demonstrate both the live interactive output and the code:

````mdx
# Component Name

Brief description of the component's purpose and Base UI foundation.

import { ComponentNameDemo } from "@/components/ComponentNameDemo";

## Live Interactive Demo

<ComponentNameDemo />

## Usage

### 1. High-Level Entry Component (Zero Boilerplate)

```tsx
import { ComponentName } from "@bobslab/ui";

export function Example() {
  return (
    <ComponentName title="Example Title" description="Short description" />
  );
}
```

### 2. Fine-Grained Primitives (Custom Assembly)

```tsx
import {
  ComponentNameRoot,
  ComponentNameTrigger,
  ComponentNameContent,
} from "@bobslab/ui";

export function CustomExample() {
  return (
    <ComponentNameRoot>
      <ComponentNameTrigger>Click Me</ComponentNameTrigger>
      <ComponentNameContent>Custom content</ComponentNameContent>
    </ComponentNameRoot>
  );
}
```

## Props

| Prop    | Type     | Default | Description          |
| :------ | :------- | :------ | :------------------- |
| `prop1` | `string` | `-`     | Explanation of prop1 |
````

---

## 5. Sidebar Registration

Register the page in `apps/docs/app/_meta.js`:

```js
"component-name": "Component Name",
```

---

## 6. Verification

Run from workspace root before completing:

1. `pnpm run check-types`
2. `pnpm run lint`
3. `pnpm run test`
4. `pnpm run build` — builds all packages and statically generates every Nextra docs page.
