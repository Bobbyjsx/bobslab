import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { WorkflowRun } from "./types.js";

export class DurableStateStore {
  private baseDir: string;
  private runsDir: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.baseDir = path.join(workspaceRoot, ".factory", "engine");
    this.runsDir = path.join(this.baseDir, "runs");
  }

  async init(): Promise<void> {
    await mkdir(this.runsDir, { recursive: true });
  }

  private getRunPath(runId: string): string {
    return path.join(this.runsDir, `${runId}.json`);
  }

  async saveRun(run: WorkflowRun): Promise<void> {
    await this.init();
    const filePath = this.getRunPath(run.runId);
    const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 8)}`;
    const content = JSON.stringify(run, null, 2);

    await writeFile(tempPath, content, "utf8");
    await rename(tempPath, filePath);
  }

  async getRun(runId: string): Promise<WorkflowRun | null> {
    try {
      const content = await readFile(this.getRunPath(runId), "utf8");
      return JSON.parse(content) as WorkflowRun;
    } catch {
      return null;
    }
  }

  async listRuns(): Promise<WorkflowRun[]> {
    await this.init();
    const files = await readdir(this.runsDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json") && !f.includes(".tmp."));
    const runs: WorkflowRun[] = [];

    for (const file of jsonFiles) {
      try {
        const content = await readFile(path.join(this.runsDir, file), "utf8");
        runs.push(JSON.parse(content));
      } catch {
        // Skip unreadable or corrupted files
      }
    }

    return runs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async hasIdempotencyKey(runId: string, key: string): Promise<boolean> {
    const run = await this.getRun(runId);
    return Boolean(run?.idempotencyKeys?.[key]);
  }

  async recordIdempotencyKey(runId: string, key: string, value: string): Promise<void> {
    const run = await this.getRun(runId);
    if (!run) return;
    run.idempotencyKeys = run.idempotencyKeys || {};
    run.idempotencyKeys[key] = value;
    run.updatedAt = new Date().toISOString();
    await this.saveRun(run);
  }
}
