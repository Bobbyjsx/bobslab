import { mkdir, readFile, stat, writeFile, symlink } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import type { ProjectPaths } from "./types.js";

export function getProjectPaths(root: string): ProjectPaths {
  const agents = path.join(root, ".agents");
  return {
    agents,
    gitignore: path.join(root, ".gitignore"),
    root,
    skills: path.join(agents, "skills"),
    state: path.join(agents, "ai-skills-state.json"),
  };
}

export async function initializeProject(
  paths: ProjectPaths,
  integrations: string[] = [],
): Promise<string> {
  const isGlobal = paths.root === os.homedir();
  const isProj = await isProjectRoot(paths.root);

  const hadAgents = await exists(paths.agents);
  const hadSkills = await exists(paths.skills);
  await mkdir(paths.skills, { recursive: true });

  // Antigravity integration
  if (integrations.includes("antigravity")) {
    await writeFile(
      path.join(paths.agents, "skills.json"),
      JSON.stringify({ entries: [{ path: ".agents/skills" }] }, null, 2),
    );
  }

  // Claude Code integration
  if (integrations.includes("claude")) {
    const claudeDir = path.join(paths.root, ".claude");
    await mkdir(claudeDir, { recursive: true });
    const claudeSkills = path.join(claudeDir, "skills");
    if (!(await exists(claudeSkills))) {
      await symlink("../.agents/skills", claudeSkills, "dir");
    }
  }

  // Codex integration
  if (integrations.includes("codex")) {
    const codexDir = path.join(paths.root, ".codex");
    await mkdir(codexDir, { recursive: true });
    const codexSkills = path.join(codexDir, "skills");
    if (!(await exists(codexSkills))) {
      await symlink("../.agents/skills", codexSkills, "dir");
    }
  }

  // Cursor rules directory
  if (integrations.includes("cursor")) {
    const cursorDir = path.join(paths.root, ".cursor", "rules");
    await mkdir(cursorDir, { recursive: true });
  }

  // Only update gitignore if it's a project root and NOT global
  let gitignoreResult = "No .gitignore to update.";
  if (!isGlobal && (isProj || (await exists(paths.gitignore)))) {
    gitignoreResult = await updateGitignore(paths.gitignore, integrations);
  }

  const gitResult =
    !isGlobal && (await exists(path.join(paths.root, ".git")))
      ? "Git metadata detected."
      : "Git metadata was not found.";
  return `${hadAgents ? ".agents already existed" : "Created .agents"}. ${hadSkills ? ".agents/skills already existed" : "Created .agents/skills"}. ${gitignoreResult} ${gitResult}`;
}

async function updateGitignore(
  filePath: string,
  integrations: string[],
): Promise<string> {
  const content = (await exists(filePath))
    ? await readFile(filePath, "utf8")
    : "";
  const current = content
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\/$/, ""));

  const toIgnore = [".agents/skills/", ".agents/ai-skills-state.json"];
  if (integrations.includes("antigravity"))
    toIgnore.push(".agents/skills.json");
  if (integrations.includes("claude")) toIgnore.push(".claude/");
  if (integrations.includes("codex")) toIgnore.push(".codex/");
  if (integrations.includes("cursor")) toIgnore.push(".cursor/rules/");

  const missing = toIgnore.filter(
    (entry) => !current.includes(entry.replace(/\/$/, "")),
  );
  if (missing.length === 0)
    return ".gitignore already contained ai-skills entries.";
  await writeFile(
    filePath,
    `${content && !content.endsWith("\n") ? `${content}\n` : content}${missing.join("\n")}\n`,
  );
  return "Updated .gitignore.";
}

export async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isProjectRoot(root: string): Promise<boolean> {
  return (
    (await exists(path.join(root, "package.json"))) ||
    (await exists(path.join(root, "pnpm-workspace.yaml"))) ||
    (await exists(path.join(root, ".git")))
  );
}
