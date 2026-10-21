---
name: antislop-code
description: "Code comment hygiene for AI coding agents: remove generic AI-slop comments, keep the valuable ones, never touch the code."
tags: [quality, antislop, standards]
version: 1.0.0
---

# Antislop Code Standards

## Purpose

Code comment hygiene and anti-slop rules for all Bobslab agents and contributors. Eliminates decorative, redundant, loud, or robotic comments while preserving critical explanations of intent, edge cases, workarounds, and contracts.

---

## Prohibited Patterns (Do Not Output)

1. **Decorative Separators & Banners**:
   - ❌ `// =======================`, `/* ---- ACTIONS ---- */`, `// -------- WORKFLOW --------`
   - ✔ Use clean whitespace between logical sections.

2. **Restating the Obvious**:
   - ❌ `// Initialize the variable` above `let count = 0`
   - ❌ `// User class` above `class User {}`
   - ❌ `// Validate user` above `function validateUser()`
   - ✔ Omit comments that duplicate the identifier or statement.

3. **Step-by-Step Workflow Narration**:
   - ❌ `// Step 1: Validate input`, `// Step 2: Query database`, `// Step 3: Return response`
   - ❌ `// First...`, `// Next...`, `// Finally...`
   - ✔ Let clean control flow and small functions express sequencing.

4. **Empty Labels & Vague Placeholders**:
   - ❌ `// Main logic`, `// Core logic`, `// Helper function`, `// Note: This is important`
   - ❌ `// TODO: Improve this`, `// Future improvements`
   - ✔ Only keep TODOs that specify an actionable task with concrete rationale.

5. **Decorative Emoji & Loud Formatting**:
   - ❌ `// ✅ Validation passed`, `// 🚀 Fast path`, `// 🔥 WARNING`
   - ❌ ALL CAPS comments `// HANDLE ERROR HERE`
   - ✔ Use sentence case, natural tone, and professional technical language.

6. **End Markers**:
   - ❌ `} // end if`, `} // end function`
   - ✔ Let closing braces stand on their own.

---

## Required Patterns (Preserve & Use)

Write concise comments (1–2 lines) only when explaining:

- Non-obvious business logic and intent ("Why", not "What").
- Architectural decisions and trade-offs.
- Workarounds for platform, browser, or third-party quirks.
- Concurrency, locking, or timing constraints.
- Security and authorization requirements.

---

## Code Comment Checklist

Before submitting code, verify:

- [ ] Does every comment add non-obvious context not already evident from the code?
- [ ] Are decorative banners, repeated dividers, and emoji eliminated?
- [ ] Is narrative step-by-step commentary omitted?
- [ ] Are comments brief, professional, and written in sentence case?
- [ ] Is code logic untouched when cleaning comments?
