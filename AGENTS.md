# Frontend & AI Agent Engineering Guide for Bobslab

## Application Purpose
**Bobslab** is a production-ready component library, toolchain, and utility monorepo built with Turborepo, React 19, Base UI primitives, Tailwind CSS v4, and Nextra 4.

## Monorepo Architecture
Turborepo monorepo managed with `pnpm`:
- `packages/ui`: Core UI component library (`@bobslab/ui`).
- `packages/config`: Consolidated tooling configurations (ESLint, Prettier, TypeScript, Biome, Zed, VSCode) and design tokens (`@bobslab/config`).
- `packages/ai-skills`: Canonical AI coding-agent skills and config distribution CLI (`@bobslab/ai-skills` / `ai-skills`).
- `packages/icons`: Standardized SVG icon primitives.
- `packages/hooks`: SSR-safe React hooks.
- `packages/utils`: Utility functions (`cn`, formatting, financial math).
- `packages/ai`: AI streaming parsers and prompt codecs.
- `packages/auth`: Auth token manager and JWT utilities.
- `apps/docs`: Next.js 15 App Router & Nextra 4 documentation portal.

---

## Core Architectural Invariants

### 1. Dual-Layer Component Architecture
Whenever building or updating components in `@bobslab/ui`:
- **Export Primitives**: Export every low-level building block (`*Root`, `*Trigger`, `*Content`, `*Header`, `*Footer`, `*Title`, `*Description`, `*Close`) for consumers who require granular layout, headless flexibility, or custom slot composition.
- **Export One High-Level Entry Component**: Build and export a single primary component (e.g. `Dialog`, `Tabs`, `Select`) that wraps the primitives and accepts ergonomic props (`trigger`, `title`, `description`, `footer`, `items`, `children`) so consumers who do not want fine-grained primitive assembly can use the component immediately with zero boilerplate.

### 2. Mandatory Live Output in Docs Writing
Whenever writing or updating documentation in `apps/docs`:
- **Show the Live Output**: You MUST show the actual rendered output of whatever is being demoed in the docs. Static markdown code snippets alone are strictly prohibited when demoing UI components or visual features.
- Mount interactive demo components (from `apps/docs/components/<Component>Demo.tsx`) in MDX alongside or above the code.

### 3. Consolidated Toolchain Configs
Toolchain configs live canonically in `@bobslab/config`:
- **Modular Imports**: ESLint (`@bobslab/config/eslint`), Prettier (`@bobslab/config/prettier`), TypeScript (`@bobslab/config/typescript/base.json`), and Biome (`@bobslab/config/biome`) can be imported or extended directly in project files.
- **CLI Pull**: Editor configs (Zed, VSCode) and project configs that do not support modular imports can be pulled into local workspace files via `ai-skills config pull <target>` (or `ai-skills config pull all`).

---

## Component Discovery Workflow (MANDATORY)

Before creating ANY new component or abstraction:
1. Search existing UI components in `packages/ui/src/components/`.
2. Search Base UI primitives (`@base-ui/react`).
3. Check documented components in `apps/docs/app/`.
4. Determine whether existing primitives satisfy the requirement.
5. Only create a new component if no existing component provides the required behavior and composition is insufficient.

---

## AI Agent Workflow
Understand → Discover Skill → Inspect existing patterns → Plan → Implement → Test → Validate → Review → Report

1. **Understand**: Clarify requirements, acceptance criteria, and constraints.
2. **Discover Skill**: Check `.agents/skills/`. Select the most specific skill (e.g. `create-component`, `docs-writing`, `component-implementation`, `bug-fixing`), read its `SKILL.md`, and strictly apply its workflow.
3. **Inspect**: Inspect existing patterns before modifying code.
4. **Plan**: Formulate a concise plan respecting package boundaries.
5. **Implement**: Implement minimal, high-cohesion code matching Bobslab patterns.
6. **Test**: Add/update unit and component tests in `tests/`.
7. **Validate**: Run `pnpm run check-types`, `pnpm run lint`, `pnpm run test`, and `pnpm run build`.
8. **Review**: Self-review for correctness, accessibility, regressions, and clean code principles.
9. **Report**: Summarize changed files, validation status, and remaining risks.

Instruction Precedence:
1. Existing repository implementation patterns
2. Repository `AGENTS.md`
3. Applicable Skill in `.agents/skills/`
4. Base UI & React conventions

---

## Anti-Slop Code Standards (`antislop-code`)
Every agent writing or reviewing code in Bobslab must strictly adhere to comment hygiene and anti-slop rules:
- **No Decorative Separators**: Never write `// =====`, `/* ---- */`, or banner boxes.
- **No Restating the Obvious**: Never write comments like `// Initialize variable` above `let x = 0`.
- **No Workflow Narration**: Never write `// Step 1: ...`, `// Step 2: ...`, `// First...`, `// Finally...`.
- **No Empty Labels**: Omit `// Main logic`, `// Core logic`, `// Helper function`.
- **No Decorative Emoji**: Ban `✅`, `🚀`, `🔥`, `🔒` in code comments.
- **Why > What**: Comments must explain the *why* (non-obvious intent, constraints, platform workarounds, security), never what the code line visibly does. Max 1-2 lines.

---

## Agentic SDLC Software Factory (`sdlc`)
Bobslab uses a fully skill-driven, zero-hosting, zero-deployment Software Development Life Cycle factory:
- **Master Orchestrator (`sdlc`)**: Acts as Product Manager and workflow coordinator. Never writes code or authors tests.
- **Fan-Out Sub-Skills**:
  - `sdlc-architect`: Codebase discovery, dependency mapping, and verifiable plan drafting.
  - `sdlc-implementer`: Atomic feature implementation in isolated worktrees (`.factory/worktrees/sdlc-<task>`).
  - `sdlc-test-engineer`: Requirements-driven test authoring without assertion weakening.
  - `sdlc-qa`: Independent verification of exact candidate commit SHAs and anti-tamper test baseline comparison.
  - `sdlc-triage`: Defect diagnosis, bounded retries (max 3), and escalation.
  - `sdlc-release`: Staging PR merge and smoke test execution strictly after Gate B approval.
- **Governance Gates**:
  - **Gate A**: Explicit human approval of the plan required before writing any code.
  - **Gate B**: Explicit human approval of verified QA evidence required before merging to staging.
- **Artifacts**: Authoritative state is projected to `.factory/brain/SDLC-<run-id>.md` and recorded in `.factory/logs/<run-id>.jsonl`.

