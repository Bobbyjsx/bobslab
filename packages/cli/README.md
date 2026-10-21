# @bobslab/cli

The official developer CLI for Bobslab, distributing AI agent skills and workspace toolchain configurations.

Executables: `bobslab` (primary), `bobs-lab` (alias), `ai-skills` (compatibility).

---

## Installation & Execution

### Run without installing (Recommended)
```sh
pnpm dlx @bobslab/cli --help
# or
npx @bobslab/cli --help
```

### In a monorepo workspace
```sh
pnpm add -D @bobslab/cli
pnpm exec bobs-lab --help
```

---

## Commands

### 1. AI Skills Management (`bobs-lab skills`)

- `bobs-lab skills list`: Lists all skills bundled with Bobslab.
- `bobs-lab skills pull [skills...]`: Materializes named Skills or Skill tags into the workspace:
  ```sh
  bobs-lab skills pull @frontend
  bobs-lab skills pull @sdlc
  bobs-lab skills pull antislop-code create-component
  ```
- `bobs-lab skills init`: Prepares the workspace and configures agent integrations (`.agents/`, `.cursor/rules/`, `.claude/`, `.codex/`).
- `bobs-lab skills status`: Checks for out-of-date or modified local skills.
- `bobs-lab skills update`: Updates locally materialized skills to the latest bundled versions.

### 2. Workspace Config Management (`bobs-lab config`)

- `bobs-lab config list`: Lists all available toolchain configurations (`zed`, `vscode`, `biome`, `prettier`, `eslint`, `typescript`).
- `bobs-lab config pull [targets...]`: Pulls configuration files directly into the workspace:
  ```sh
  bobs-lab config pull zed
  bobs-lab config pull vscode
  bobs-lab config pull all
  ```

---

## Core Monorepo Principles

1. **Dual-Layer Component Design**:
   - Primitives are exported for fine-grained control (`DialogRoot`, `DialogTrigger`, `DialogContent`, etc.).
   - A single high-level entry component (`Dialog`) is also provided for direct, zero-boilerplate usage.
2. **Live Output in Documentation**:
   - Documentation must always render the live output of whatever is being demoed in the docs alongside the code.
3. **Consolidated Toolchain Configs**:
   - Toolchain configs (`eslint`, `prettier`, `typescript`, `biome`, `zed`, `vscode`) live canonically in `@bobslab/config`.
   - Modular configs can be imported via package references, while editor/workspace configs (Zed, VSCode) can be pulled via `bobs-lab config pull`.
