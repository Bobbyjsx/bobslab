import type { AgentRole } from "../core/types.js";

export interface WorkerSpec {
  role: AgentRole;
  taskTitle: string;
  instructions: string;
  allowedTools: string[];
  workingDirectory?: string;
  timeoutMs?: number;
  environment?: Record<string, string>;
}

export interface WorkerSession {
  sessionId: string;
  role: AgentRole;
  provider: "antigravity" | "codex" | "local";
  status: "running" | "completed" | "failed" | "cancelled" | "disconnected";
  startedAt: string;
  output?: string;
  error?: string;
}

export interface WorkerStatus {
  sessionId: string;
  status: "running" | "completed" | "failed" | "cancelled" | "disconnected";
  progress?: string;
  exitCode?: number;
}

export interface WorkerOutput {
  sessionId: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  structuredArtifacts?: Record<string, unknown>;
}

export interface AgentRuntimeAdapter {
  readonly provider: "antigravity" | "codex" | "local";
  spawnWorker(spec: WorkerSpec): Promise<WorkerSession>;
  trackWorker(sessionId: string): Promise<WorkerStatus>;
  getWorkerOutput(sessionId: string): Promise<WorkerOutput>;
  cancelWorker(sessionId: string): Promise<void>;
  resumeWorker(sessionId: string): Promise<WorkerSession>;
}
