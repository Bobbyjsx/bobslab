---
name: accessibility-review
description: Define the workflow for Accessibility Review tasks in Bobslab.
tags: [frontend, a11y, review]
version: 1.0.0
---

# Accessibility Review

## Purpose

Define the workflow for Accessibility Review tasks across Bobslab components and applications.

## When to Use

Use this skill when auditing UI components for WCAG compliance, keyboard navigation, screen reader compatibility, and ARIA attributes.

## Key Focus Areas

1. **Base UI Primitives**: Verify Base UI ARIA defaults are preserved.
2. **Keyboard Navigation**: Verify Tab, Arrow, Escape, and Enter keys behave correctly.
3. **Focus Management**: Verify focus trapping in dialogs/modals and focus restoration on close.
4. **Contrast**: Check color contrast ratios for light and dark themes using OKLCH colors.
5. **Labels and Roles**: Ensure all interactive elements have accessible names (`aria-label`, `<span className="sr-only">`).
