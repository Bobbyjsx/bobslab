import type { Dirent } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { AiSkillsError } from "../core/errors.js";
import type { Skill } from "./types.js";

export async function discoverSkills(
  directory: string,
  packageVersion: string,
): Promise<Skill[]> {
  const entries = await readSkillDirectories(directory);
  const skills = await Promise.all(
    entries.map((entry) => readSkill(directory, entry.name, packageVersion)),
  );
  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

async function readSkillDirectories(
  directory: string,
): Promise<Dirent<string>[]> {
  try {
    return (await readdir(directory, { withFileTypes: true })).filter((entry) =>
      entry.isDirectory(),
    );
  } catch {
    throw new AiSkillsError(
      `Could not read bundled skills at ${directory}. Reinstall @bobslab/cli and try again.`,
    );
  }
}

async function readSkill(
  directory: string,
  directoryName: string,
  packageVersion: string,
): Promise<Skill> {
  const skillPath = path.join(directory, directoryName, "SKILL.md");
  let content: string;
  try {
    content = await readFile(skillPath, "utf8");
  } catch {
    throw new AiSkillsError(`Could not read skill metadata at ${skillPath}.`);
  }
  const yaml = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  const name = yaml?.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = yaml?.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  const tags = parseTags(yaml?.match(/^tags:\s*(.+)$/m)?.[1]);
  const version =
    yaml?.match(/^version:\s*(.+)$/m)?.[1]?.trim() ?? packageVersion;
  if (
    !name ||
    !description ||
    !isSkillName(name) ||
    name !== directoryName ||
    tags.some((tag) => !isSkillTag(tag))
  )
    throw new AiSkillsError(`Skill metadata at ${skillPath} is malformed.`);
  return {
    description,
    filesDirectory: path.join(directory, directoryName),
    name,
    tags,
    version,
  };
}

const parseTags = (value: string | undefined): string[] => {
  if (!value) return [];
  const normalized = value.trim().replace(/^\[|\]$/g, "");
  return normalized
    .split(",")
    .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
};

export function isSkillName(name: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name);
}

export function isSkillTag(tag: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag);
}
