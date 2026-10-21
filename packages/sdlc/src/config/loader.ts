import { readFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_SDLC_CONFIG, type SdlcConfig } from "./schema.js";

export async function loadSdlcConfig(workspaceRoot: string = process.cwd()): Promise<SdlcConfig> {
  const configPath = path.join(workspaceRoot, "sdlc.config.json");
  try {
    const content = await readFile(configPath, "utf8");
    const parsed = JSON.parse(content);
    return {
      ...DEFAULT_SDLC_CONFIG,
      ...parsed,
      linear: { ...DEFAULT_SDLC_CONFIG.linear, ...parsed.linear },
      github: { ...DEFAULT_SDLC_CONFIG.github, ...parsed.github },
      retries: { ...DEFAULT_SDLC_CONFIG.retries, ...parsed.retries },
      testIntegrity: { ...DEFAULT_SDLC_CONFIG.testIntegrity, ...parsed.testIntegrity },
      staging: { ...DEFAULT_SDLC_CONFIG.staging, ...parsed.staging },
    };
  } catch {
    return DEFAULT_SDLC_CONFIG;
  }
}
