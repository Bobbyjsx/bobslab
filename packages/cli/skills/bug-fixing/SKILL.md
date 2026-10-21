---
name: bug-fixing
description: Define the workflow for Bug Fixing tasks in Bobslab.
tags: [frontend, bug, maintenance]
version: 1.0.0
---

# Bug Fixing

## Purpose

Define the workflow for reproducing, isolating, fixing, and verifying bugs.

## Workflow

1. **Reproduce**: Replicate the issue with a minimal failing test or reproduction step.
2. **Isolate**: Identify the root cause without touching unrelated modules.
3. **Fix**: Apply the minimal targeted fix maintaining backwards compatibility.
4. **Test**: Ensure the reproduction test now passes and no existing tests break.
5. **Verify**: Run `pnpm run test` and `pnpm run build`.
