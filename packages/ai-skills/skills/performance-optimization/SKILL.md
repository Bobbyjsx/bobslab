---
name: performance-optimization
description: Define the workflow for Performance Optimization tasks in Bobslab.
tags: [performance, frontend]
version: 1.0.0
---

# Performance Optimization

## Purpose

Define the standards for optimizing runtime performance, bundle size, and tree-shakability.

## Rules

1. **Tree-Shaking**: Ensure all component exports in `@bobslab/ui` and utilities in `@bobslab/utils` are tree-shakable.
2. **Bundle Impact**: Avoid heavy runtime dependencies when lightweight alternatives or Base UI primitives suffice.
3. **Memoization**: Use `React.useMemo` and `React.useCallback` judiciously for expensive computations or stable callbacks.
