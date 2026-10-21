---
name: code-review
description: Define the workflow for Code Review tasks in Bobslab.
tags: [review, quality]
version: 1.0.0
---

# Code Review

## Purpose

Define the standards for reviewing changes in the Bobslab monorepo.

## Review Pillars

- **Architecture**: Follows monorepo boundaries (`@bobslab/ui`, `@bobslab/config`, `@bobslab/utils`, etc.).
- **Dual-Layer Design**: UI components export both fine-grained primitives and a single entry component.
- **Documentation**: Docs demonstrate the live rendered output of features, not just static code.
- **Anti-Slop Hygiene (`antislop-code`)**:
  - Rejects decorative separator banners (`// =====`, `/* ---- */`), ALL CAPS labels, and decorative emoji (`✅`, `🚀`, `🔥`).
  - Rejects line-by-line or step-by-step narration comments (`// Step 1: ...`, `// Initialize count`).
  - Rejects restating the obvious (`// User model` above `interface User`).
  - Ensures surviving comments explain _why_ (non-obvious rationale, platform workarounds, security) rather than _what_, capped at 1-2 lines.
- **TypeScript**: Strict types without `any` (unless strictly unavoidable).
- **Clean Code**: SRP, DRY, KISS, YAGNI, Boy Scout rule.
