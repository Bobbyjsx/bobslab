import type { AgentRuntimeAdapter, WorkerOutput, WorkerSession, WorkerSpec, WorkerStatus } from "./adapter.interface.js";

export class CodexRuntimeAdapter implements AgentRuntimeAdapter {
  readonly provider = "codex" as const;
  private sessions: Map<string, WorkerSession> = new Map();
  private outputs: Map<string, WorkerOutput> = new Map();

  async spawnWorker(spec: WorkerSpec): Promise<WorkerSession> {
    const sessionId = `codex_${spec.role}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // In OpenAI Codex, tasks are dispatched through Codex CLI execution with injected instructions
    const session: WorkerSession = {
      sessionId,
      role: spec.role,
      provider: "codex",
      status: "running",
      startedAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, session);

    this.outputs.set(sessionId, {
      sessionId,
      exitCode: 0,
      stdout: `[OpenAI Codex] Dispatched worker with role "${spec.role}". Task: ${spec.taskTitle}\nAllowed tools: ${spec.allowedTools.join(", ")}`,
      stderr: "",
    });

    return session;
  }

  async trackWorker(sessionId: string): Promise<WorkerStatus> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { sessionId, status: "disconnected" };
    }
    return {
      sessionId,
      status: session.status,
    };
  }

  async getWorkerOutput(sessionId: string): Promise<WorkerOutput> {
    return (
      this.outputs.get(sessionId) ?? {
        sessionId,
        exitCode: 1,
        stdout: "",
        stderr: `Session ${sessionId} not found.`,
      }
    );
  }

  async cancelWorker(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = "cancelled";
    }
  }

  async resumeWorker(sessionId: string): Promise<WorkerSession> {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        role: "implementer",
        provider: "codex",
        status: "running",
        startedAt: new Date().toISOString(),
      };
      this.sessions.set(sessionId, session);
    } else {
      session.status = "running";
    }
    return session;
  }

  /**
   * Test helper to simulate worker completion with specified results.
   */
  completeSession(sessionId: string, exitCode: number, stdout: string, stderr: string = ""): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = exitCode === 0 ? "completed" : "failed";
      this.outputs.set(sessionId, { sessionId, exitCode, stdout, stderr });
    }
  }
}
