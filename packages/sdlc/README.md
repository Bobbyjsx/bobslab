# @bobslab/sdlc

> Zero-hosting, agent-native SDLC software factory for Bobslab.

`@bobslab/sdlc` provides the core durable state engine, anti-tamper test verification subsystem, brain projector, audit logger, and runtime adapters powering the **SDLC Software Factory**.

Instead of requiring external servers, CLI binaries, or deployed infrastructure, the factory runs entirely within the AI agent environment (Google Antigravity and OpenAI Codex) as a modular suite of specialized skills. The master **Orchestrator** agent coordinates work by fanning out to specialized subagents.

---

## Architecture Overview

```
[User Request]
       │
       ▼
1. INTAKE (sdlc - Orchestrator)
       │
       ▼
2. DISCOVERY (sdlc-architect)
       │
       ▼
3. GATE A HUMAN APPROVAL (Mandatory Human Gate)
  ┌────┴───────────────────────────┐
  │ [Planning-Only]                │ [Implementation Approved]
  ▼                                ▼
COMPLETED               4. DECOMPOSITION & FAN-OUT
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              IMPLEMENTER    TEST-ENGINEER       ...
            (`sdlc-impl`)   (`sdlc-test-eng`)
                    │              │
                    └──────┬───────┘
                           ▼
                    5. INDEPENDENT QA (`sdlc-qa`)
                      ┌────┴──────────┐
               [QA FAIL]             [QA PASS]
                      ▼                       ▼
            6. TRIAGE (`sdlc-triage`)  7. GATE B APPROVAL (Mandatory Human Gate)
                      │                       │
             (Bounded Retries)                ▼
                      │              8. RELEASE (`sdlc-release`)
                      └───────►               ▼
                                          COMPLETED
```

---

## Skills Suite

The factory is executed through canonical skills registered in `packages/ai-skills` and materialized into `.agents/skills/`:

| Skill | Role | Responsibilities | Forbidden Actions |
| :--- | :--- | :--- | :--- |
| `sdlc` | **Orchestrator** | PM coordinator; intake; Gate A & B governance; worker fan-out | Never writes code, authors tests, or merges PRs directly |
| `sdlc-architect` | **Architect** | Codebase inspection; component discovery; dependency mapping; verifiable plan formulation | Never writes code or commits changes |
| `sdlc-implementer` | **Implementer** | Implements features in isolated git worktrees (`.factory/worktrees/sdlc-<task>`); adheres to `antislop-code` | Never merges PRs or bypasses CI |
| `sdlc-test-engineer` | **Test Engineer** | Authors unit, integration, and component tests strictly against acceptance criteria | Never removes or weakens assertions; never adds `.skip` |
| `sdlc-qa` | **QA Auditor** | Independent verification of exact candidate commit SHA; runs typecheck, lint, tests, build, and anti-tamper comparator | Never edits code or waives test failures |
| `sdlc-triage` | **Triage Specialist** | Classifies failure root causes; enforces bounded retry budget (max 3); routes remediation | Never waives gates or ignores failures |
| `sdlc-release` | **Release Specialist** | Merges approved PRs to staging and executes automated smoke tests strictly after Gate B approval | Never merges without Gate B human approval |

---

## Governance & Approval Invariants

1. **Gate A (Plan Approval)**:
   The orchestrator must obtain explicit human developer approval of the formulated scope, architecture, acceptance criteria, and task breakdown before any implementation worker is dispatched or any branch is created.
2. **Gate B (Story Approval)**:
   The orchestrator must obtain explicit human developer approval of verified QA evidence before any pull request may be merged to staging.
3. **Anti-Tampering Invariant**:
   The `TestIntegrityComparator` compares candidate test suites against pre-implementation baselines (`.factory/artifacts/<run-id>/baseline-results.json`). Any decrease in assertions, newly introduced `.skip()` / `xit()`, or relaxed coverage thresholds triggers an immediate QA `FAIL` verdict.
4. **Isolated Worktrees**:
   Implementation workers execute inside isolated git worktrees (`.factory/worktrees/sdlc-<task-key>`) on dedicated task branches (`sdlc/<issue>-<task>`), preventing concurrent branch contention or lock collisions.
5. **Durable File-Based State**:
   All runs are persisted atomically via `DurableStateStore` to `.factory/engine/runs/<run-id>.json`. Survives process crashes and restarts without external databases.
6. **Real-Time Brain Projection**:
   Active run state, approvals, worker assignments, QA verdicts, and release manifests are projected to `.factory/brain/SDLC-<run-id>.md` in human-readable markdown.

---

## Programmatic API

The core library exports all primitives for scripting or programmatic orchestration:

```ts
import { SdlcEngine } from "@bobslab/sdlc";

const engine = new SdlcEngine();

// 1. Intake
const run = await engine.createRun("Add health check endpoint", "implementation");

// 2. Discovery
await engine.startDiscovery(run.runId);

// 3. Plan submission
await engine.submitPlanForApproval(run.runId, {
  title: "Health Check Endpoint",
  requirements: ["GET /health returns 200"],
  acceptanceCriteria: ["Validates response schema"],
  affectedModules: ["packages/auth"],
  tasks: [
    {
      id: "task_1",
      title: "Implement /health",
      description: "Health check handler",
      assignedRole: "implementer",
    },
  ],
});

// 4. Gate A Human Approval
await engine.approvePlan(run.runId, "developer@bobslab.dev");

// 5. Worker execution & QA verification
await engine.decomposeWork(run.runId);
await engine.executeImplementation(run.runId, {
  candidateSha: "abc1234567",
  filesChanged: ["packages/auth/src/health.ts"],
});
await engine.executeTestAuthoring(run.runId);
const qaRun = await engine.executeQA(run.runId, {
  candidateSha: "abc1234567",
  unitTestResults: { passed: 5, failed: 0, skipped: 0, logs: "" },
  lintPassed: true,
  typeCheckPassed: true,
});

// 6. Gate B Human Approval & Release
await engine.approveStory(run.runId, "developer@bobslab.dev");
await engine.executeRelease(run.runId);
await engine.verifyStaging(run.runId);
```

---

## Architecture Decision Record (ADR): Zero-Hosting Skill Fan-Out

### Context
Traditional SDLC factories often introduce standalone background daemons, CLI binaries, server databases, and hosted webhooks that create significant maintenance overhead, deployment complexity, and configuration friction.

### Decision
We designed Bobslab's SDLC factory to be completely **agent-native and zero-hosting**:
- The orchestration logic resides entirely within repository skills (`sdlc` and its sub-skills).
- The state layer uses atomic file operations in `.factory/`, eliminating external database dependencies.
- Multi-agent coordination is achieved through agent-runtime fan-out (spawning subagents in Antigravity or dispatching CLI sessions in Codex).
- The human developer controls and inspects the factory directly inside their AI pair-programming environment without leaving the editor or deploying services.
