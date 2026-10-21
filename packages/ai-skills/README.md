# @bobslab/ai-skills

The canonical CLI and distribution package for Bobslab AI coding-agent skills and workspace toolchain configurations.

The executable is named `ai-skills` (alias: `bobslab-skills`).

## Installation & Execution

### Run without installing (Recommended)
```sh
pnpm dlx @bobslab/ai-skills --help
npx @bobslab/ai-skills --help
```

### In a monorepo workspace
```sh
pnpm add -D @bobslab/ai-skills
pnpm exec ai-skills --help
```

## Commands

- `ai-skills init`: Prepares the current project and configures agent integrations (`.agents/`, `.cursor/rules/`, `.claude/`, `.codex/`).
- `ai-skills list`: Lists all skills bundled with this package.
- `ai-skills pull [skills...]`: Materializes named Skills, all Skills, or Skills matching `@tag` (e.g. `ai-skills pull @frontend`).
- `ai-skills status`: Compares local installations with bundled skills.
- `ai-skills update`: Updates outdated installed skills.
- `ai-skills config list`: Lists all toolchain configurations (`zed`, `vscode`, `biome`, `prettier`, `eslint`, `typescript`).
- `ai-skills config pull [targets...]`: Pulls config files directly into the workspace (e.g. `ai-skills config pull zed`, `ai-skills config pull all`).

## Core Architecture Principles

1. **Dual-Layer Component Design**:
   - Primitives are exported for fine-grained control (`DialogRoot`, `DialogTrigger`, `DialogContent`, etc.).
   - A single high-level entry component (`Dialog`) is also provided for direct, zero-boilerplate usage.
2. **Live Output in Documentation**:
   - Documentation must always render the live output of whatever is being demoed in the docs alongside the code.
3. **Consolidated Toolchain Configs**:
   - Toolchain configs (`eslint`, `prettier`, `typescript`, `biome`, `zed`, `vscode`) live canonically in `@bobslab/config`.
   - Modular configs can be imported via package references, while editor/workspace configs (Zed, VSCode) can be pulled via `ai-skills config pull`.
