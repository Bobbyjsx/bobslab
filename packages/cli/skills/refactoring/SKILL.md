---
name: refactoring
description: Define the workflow for Refactoring tasks in Bobslab.
tags: [refactoring, quality]
version: 1.0.0
---

# Refactoring

## Purpose

Define safe, incremental refactoring workflows that improve code structure without altering external behavior.

## Rules

1. Preserve existing public API contracts and types.
2. Verify existing test suite passes before beginning refactoring.
3. Make small, atomic refactors.
4. Verify all tests and type checks pass after each step.
