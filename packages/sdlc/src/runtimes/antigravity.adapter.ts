import type { AgentRuntimeAdapter, WorkerOutput, WorkerSession, WorkerSpec, WorkerStatus } from "./adapter.interface.js";

export class AntigravityRuntimeAdapter implements AgentRuntimeAdapter {
  readonly provider = "antigravity" as const;
  private sessions: Map<string, WorkerSession> = new Map();
  private outputs: Map<string, WorkerOutput> = new Map();

  async spawnWorker(spec: WorkerSpec): Promise<WorkerSession> {
    const sessionId = `agy_${spec.role}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // In Antigravity runtime, workers are spawned as isolated subagents with explicit tool permissions
    const session: WorkerSession = {
      sessionId,
      role: spec.role,
      provider: "antigravity",
      status: "running",
      startedAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, session);

    // Initial output buffer
    this.outputs.set(sessionId, {
      sessionId,
      exitCode: 0,
      stdout: `[Antigravity] Worker spawned with role "${spec.role}". Task: ${spec.taskTitle}\nAllowed tools: ${spec.allowedTools.join(", ")}`,
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
        provider: "antigravity",
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
