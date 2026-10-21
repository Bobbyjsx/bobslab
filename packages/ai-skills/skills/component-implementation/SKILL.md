---
name: component-implementation
description: Define the workflow for Component Implementation tasks in Bobslab.
tags: [frontend, component, ui]
version: 1.0.0
---

# Component Implementation

## Purpose

Define the workflow for Component Implementation tasks in Bobslab.

## When to Use

Use this skill when assigned a task to implement or extend components in `@bobslab/ui`.

## Mandatory Discovery Workflow

Before writing any new component code, perform component discovery:

1. Search existing UI components in `packages/ui/src/components/`.
2. Search Base UI primitives (`@base-ui/react`).
3. Search documented components in `apps/docs/app/`.
4. Determine whether existing primitives satisfy the requirement.
5. Only create a new component if no existing component provides the behavior and composition is insufficient.

## Architecture: Dual-Layer Export Pattern

Every component must follow Bobslab's dual-layer API design:
1. **Primitives**: Export fine-grained sub-components (`DialogRoot`, `DialogTrigger`, `DialogContent`, etc.) for consumers needing granular layout control.
2. **Single Entry Component**: Export a primary composite component (`Dialog`) that wraps primitives and accepts ergonomic props (`trigger`, `title`, `description`, `footer`, `items`, etc.) for consumers who do not want fine-grained assembly.

## Workflow

Understand → Discover → Plan → Implement → Test → Document (with Live Output) → Verify

## Verification Checklist

- [ ] Dual-layer API implemented (primitives + single entry component)
- [ ] Tailwind CSS v4 styling with `cn` from `@bobslab/utils`
- [ ] `antislop-code` hygiene applied: no decorative dividers, no obvious narration, only non-obvious intent documented
- [ ] Exported in `packages/ui/src/index.ts`
- [ ] Unit/component tests added in `packages/ui/tests/`
- [ ] Interactive demo created in `apps/docs/components/` rendering live output
- [ ] MDX documentation page updated in `apps/docs/app/`
- [ ] `pnpm run build` succeeds
