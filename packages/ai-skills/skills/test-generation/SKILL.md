---
name: test-generation
description: Define the workflow for Test Generation tasks in Bobslab.
tags: [testing, vitest]
version: 1.0.0
---

# Test Generation

## Purpose

Define the workflow for writing comprehensive Vitest tests for components, hooks, utilities, and configs in Bobslab.

## Standards

1. Colocate tests in `tests/` directories within each package.
2. Cover:
   - Happy paths.
   - Edge cases (null, empty strings, undefined inputs, missing env).
   - Component rendering, variant classes, accessibility roles.
3. Keep test assertions focused, predictable, and fast.
