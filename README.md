# Bobslab

Production-ready component library, toolchain, and utility monorepo built with Turborepo, React 19, Base UI primitives, Tailwind CSS v4, Nextra 4, and an agentic SDLC software factory.

---

## Packages & Applications

| Package / App | Description |
| :--- | :--- |
| [`@bobslab/ui`](./packages/ui) | Dual-layer component library combining headless Base UI primitives with ergonomic high-level entry components. |
| [`@bobslab/config`](./packages/config) | Shared toolchain configurations (ESLint, Prettier, TypeScript, Biome, Zed, VSCode) and design tokens. |
| [`@bobslab/cli`](./packages/cli) | Official developer CLI (`bobslab` / `bobs-lab`) for pulling AI agent skills and workspace toolchain configs. |
| [`@bobslab/icons`](./packages/icons) | Standardized SVG icon primitives. |
| [`@bobslab/hooks`](./packages/hooks) | SSR-safe React hooks (`useControllableState`, `useMediaQuery`, `useDebounce`, `useClipboard`, etc.). |
| [`@bobslab/utils`](./packages/utils) | Core utility functions (`cn`, case transforms, formatters, and financial math). |
| [`@bobslab/ai`](./packages/ai) | SSE streaming chunk parsers, prompt codecs, and rate-limit countdown calculators. |
| [`@bobslab/auth`](./packages/auth) | In-memory token manager, JWT decoder, and token expiration calculators. |
| [`apps/docs`](./apps/docs) | Next.js 15 App Router & Nextra 4 documentation site with live interactive component previews. |

---

## Core Invariants

1. **Dual-Layer Component Architecture (`@bobslab/ui`)**:
   - Every component exports fine-grained primitives (`*Root`, `*Trigger`, `*Content`, `*Header`, `*Footer`, `*Title`, `*Description`, `*Close`) for headless composition.
   - Every component also exports a primary entry component (e.g. `<Dialog trigger="..." title="..." />`, `<Tabs items={[...]} />`) with zero boilerplate for standard usage.

2. **Mandatory Live Output in Documentation**:
   - Every UI component or visual feature documented in `apps/docs` renders live interactive component previews alongside or above code snippets.

3. **Consolidated Toolchain Configs (`@bobslab/config` & `@bobslab/cli`)**:
   - Modular configs can be imported directly (`@bobslab/config/eslint`, `@bobslab/config/prettier`, `@bobslab/config/typescript/base.json`, `@bobslab/config/biome`).
   - Editor configs without modular import support (Zed, VSCode) can be materialized locally using `bobs-lab config pull <target>`.

4. **Agentic SDLC Software Factory**:
   - Fully skill-driven, zero-hosting, zero-deployment Software Development Life Cycle factory (`sdlc`, `sdlc-architect`, `sdlc-implementer`, `sdlc-test-engineer`, `sdlc-qa`, `sdlc-triage`, `sdlc-release`).
   - Governed by explicit human approval gates: Gate A (plan approval before code) and Gate B (QA evidence approval before staging merge).

5. **Python Backend Engineering Guidelines (`python-backend`)**:
   - Canonical standards for async-first FastAPI, layered architecture (`routers → services → repositories → datastore`), Pydantic v2 schemas, Firestore emulator testing, and constant-time auth security invariants.

---

## Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 9

### Install Dependencies
```sh
pnpm install
```

### Development
```sh
# Start docs and packages in dev mode
pnpm run dev

# Run CLI directly
pnpm run bobs-lab --help
```

### Build & Verification
```sh
# Run TypeScript typechecks across all packages
pnpm run check-types

# Run tests
pnpm run test

# Build all packages and docs
pnpm run build
```

---

## CLI Usage

Distribute agent skills or pull toolchain configs:

```sh
# Skills
pnpm exec bobs-lab skills list
pnpm exec bobs-lab skills pull @frontend
pnpm exec bobs-lab skills pull antislop-code create-component

# Configs
pnpm exec bobs-lab config list
pnpm exec bobs-lab config pull zed
pnpm exec bobs-lab config pull vscode
pnpm exec bobs-lab config pull all
```

---

## License

MIT
