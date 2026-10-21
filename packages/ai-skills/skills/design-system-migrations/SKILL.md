---
name: design-system-migrations
description: Define the workflow for Design-System Migrations tasks in Bobslab.
tags: [frontend, design-system]
version: 1.0.0
---

# Design-System Migrations

## Purpose

Define the workflow for migrating tokens, Tailwind CSS v4 variables, and component APIs.

## Guidelines

1. Always preserve backwards-compatible aliases when renaming tokens or components.
2. Ensure OKLCH variables in `@bobslab/config` (`theme.css`) are updated in lockstep.
3. Update interactive demos in `apps/docs` to reflect updated design tokens.
4. Test both light and dark modes.
