import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { redactObject, redactSecrets } from "../utils/redact.js";
import type { AuditEvent, WorkflowState, AgentRole } from "./types.js";

export class AuditEventLogger {
  private logsDir: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.logsDir = path.join(workspaceRoot, ".factory", "logs");
  }

  async init(): Promise<void> {
    await mkdir(this.logsDir, { recursive: true });
  }

  async recordEvent(
    runId: string,
    previousState: WorkflowState,
    nextState: WorkflowState,
    trigger: string,
    role: AgentRole | "system" | "human",
    commitSha?: string,
    metadata?: Record<string, unknown>,
  ): Promise<AuditEvent> {
    await this.init();

    const sanitizedTrigger = redactSecrets(trigger);
    const sanitizedMetadata = metadata ? redactObject(metadata) : undefined;

    const event: AuditEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      runId,
      timestamp: new Date().toISOString(),
      previousState,
      nextState,
      trigger: sanitizedTrigger,
      role,
      commitSha,
      metadata: sanitizedMetadata,
    };

    const filePath = path.join(this.logsDir, `${runId}.jsonl`);
    await appendFile(filePath, `${JSON.stringify(event)}\n`, "utf8");
    return event;
  }
}
