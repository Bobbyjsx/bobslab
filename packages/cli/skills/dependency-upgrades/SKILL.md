---
name: dependency-upgrades
description: Define the workflow for Dependency Upgrades tasks in Bobslab.
tags: [maintenance, dependencies]
version: 1.0.0
---

# Dependency Upgrades

## Purpose

Define the workflow for upgrading dependencies across the Bobslab monorepo.

## Workflow

1. Check peer dependencies and compatibility with React 19, Next.js 15, and Base UI.
2. Upgrade target package(s) using `pnpm --filter <pkg> update <dep>`.
3. Check for API changes or deprecation warnings.
4. Run `pnpm run check-types` and `pnpm run test`.
5. Run `pnpm run build` to verify production builds across the workspace.
