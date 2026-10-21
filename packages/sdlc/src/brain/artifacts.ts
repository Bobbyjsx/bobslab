import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export class ArtifactManager {
  private artifactsDir: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.artifactsDir = path.join(workspaceRoot, ".factory", "artifacts");
  }

  private getRunArtifactsDir(runId: string): string {
    return path.join(this.artifactsDir, runId);
  }

  async saveArtifact<T>(runId: string, name: string, data: T): Promise<string> {
    const dir = this.getRunArtifactsDir(runId);
    await mkdir(dir, { recursive: true });

    const filePath = path.join(dir, name.endsWith(".json") ? name : `${name}.json`);
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    return filePath;
  }

  async loadArtifact<T>(runId: string, name: string): Promise<T | null> {
    const filePath = path.join(
      this.getRunArtifactsDir(runId),
      name.endsWith(".json") ? name : `${name}.json`,
    );

    try {
      const content = await readFile(filePath, "utf8");
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }
}
