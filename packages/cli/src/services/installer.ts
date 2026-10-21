import { createHash } from "node:crypto";
import {
  cp,
  readFile,
  readdir,
  rename,
  rm,
  mkdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { AiSkillsError } from "../core/errors.js";
import { exists } from "./project.js";
import { isSkillName } from "./registry.js";
import type { ProjectPaths, Skill, SkillState } from "./types.js";

export interface InstallResult {
  skipped: string[];
  state: SkillState;
  updated: string[];
}

export async function installSkills(
  skills: Skill[],
  paths: ProjectPaths,
  state: SkillState,
  packageVersion: string,
  integrations: string[] = [],
  onlyOutdated = false,
): Promise<InstallResult> {
  const nextState = { ...state, packageVersion, skills: { ...state.skills } };
  const updated: string[] = [];
  const skipped: string[] = [];
  for (const skill of skills) {
    const sourceChecksum = await checksumDirectory(skill.filesDirectory);
    const installed = state.skills[skill.name];
    if (
      onlyOutdated &&
      installed?.version === skill.version &&
      installed.checksum === sourceChecksum
    )
      continue;
    const destination = getSkillDestination(paths.skills, skill.name);
    if (
      (await exists(destination)) &&
      (!installed ||
        (await checksumDirectory(destination)) !== installed.checksum)
    ) {
      skipped.push(`${skill.name} (local changes detected)`);
      continue;
    }
    await replaceSkill(skill.filesDirectory, destination);

    if (integrations.includes("cursor")) {
      await generateCursorRule(paths.root, skill);
    }

    nextState.skills[skill.name] = {
      checksum: sourceChecksum,
      version: skill.version,
    };
    updated.push(skill.name);
  }
  return { skipped, state: nextState, updated };
}

async function generateCursorRule(root: string, skill: Skill): Promise<void> {
  const cursorDir = path.join(root, ".cursor", "rules");
  await mkdir(cursorDir, { recursive: true });

  const mdcContent = `---
description: ${skill.description}
globs: *
---
# ${skill.name}

This rule is a pointer to the canonical skill definition in Bobslab.
For instructions on this workflow, YOU MUST READ the following skill file:
\`.agents/skills/${skill.name}/SKILL.md\`

Strictly execute the workflow defined in that file.
`;
  await writeFile(path.join(cursorDir, `${skill.name}.mdc`), mdcContent);
}

export async function checksumDirectory(directory: string): Promise<string> {
  const hash = createHash("sha256");
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(directory, entry.name);
    hash.update(
      entry.isDirectory()
        ? `${entry.name}/:${await checksumDirectory(entryPath)}`
        : `${entry.name}:${await readFile(entryPath)}`,
    );
  }
  return hash.digest("hex");
}

export function getSkillDestination(skillsPath: string, name: string): string {
  if (!isSkillName(name))
    throw new AiSkillsError(`Invalid skill name "${name}".`);
  const destination = path.resolve(skillsPath, name);
  if (!destination.startsWith(`${path.resolve(skillsPath)}${path.sep}`))
    throw new AiSkillsError(
      `Skill path for "${name}" is outside .agents/skills.`,
    );
  return destination;
}

async function replaceSkill(
  source: string,
  destination: string,
): Promise<void> {
  const staging = `${destination}.ai-skills-tmp`;
  await rm(staging, { force: true, recursive: true });
  await cp(source, staging, { recursive: true });
  await rm(destination, { force: true, recursive: true });
  await rename(staging, destination);
}
