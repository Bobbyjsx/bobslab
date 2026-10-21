import { readFile, writeFile } from "node:fs/promises";

import { AiSkillsError } from "../core/errors.js";
import { exists } from "./project.js";
import type { SkillState } from "./types.js";

export async function readState(
  filePath: string,
  packageVersion: string,
): Promise<SkillState> {
  if (!(await exists(filePath)))
    return { packageVersion, schemaVersion: 1, skills: {} };
  try {
    const value: unknown = JSON.parse(await readFile(filePath, "utf8"));
    if (!isSkillState(value)) throw new Error();
    return value;
  } catch {
    throw new AiSkillsError(
      `Installed skill state at ${filePath} is invalid. Remove it and run ai-skills pull.`,
    );
  }
}

export async function writeState(
  filePath: string,
  state: SkillState,
): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(state, null, 2)}\n`);
}

function isSkillState(value: unknown): value is SkillState {
  return (
    typeof value === "object" &&
    value !== null &&
    "schemaVersion" in value &&
    value.schemaVersion === 1 &&
    "packageVersion" in value &&
    typeof value.packageVersion === "string" &&
    "skills" in value &&
    typeof value.skills === "object" &&
    value.skills !== null
  );
}
