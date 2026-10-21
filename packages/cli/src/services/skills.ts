import os from "node:os";

import { AiSkillsError } from "../core/errors.js";
import { CONFIG_MANIFESTS, pullConfigs } from "./configs.js";
import {
  checksumDirectory,
  getSkillDestination,
  installSkills,
} from "./installer.js";
import { exists, getProjectPaths, initializeProject } from "./project.js";
import { discoverSkills, isSkillName, isSkillTag } from "./registry.js";
import { readState, writeState } from "./state.js";
import type { Skill, SkillState } from "./types.js";

export type { Skill } from "./types.js";

export interface SkillService {
  init(): Promise<string>;
  list(): Promise<Skill[]>;
  pull(names: string[]): Promise<string>;
  status(): Promise<string>;
  update(): Promise<string>;
  pullConfig(targets: string[]): Promise<string>;
  listConfigs(): Promise<string>;
}

export interface SkillServiceOptions {
  packageVersion: string;
  projectRoot: string;
  skillsDirectory: string;
  configsDirectory: string;
  integrations?: string[];
}

export function createSkillService(options: SkillServiceOptions): SkillService {
  const paths = getProjectPaths(options.projectRoot);
  return {
    init: () => initializeProject(paths, options.integrations),
    list: () => discoverSkills(options.skillsDirectory, options.packageVersion),
    pull: (names) => pullSkills(names, options, paths),
    status: () => getStatus(options, paths),
    update: () => updateSkills(options, paths),
    pullConfig: (targets) => pullConfiguration(targets, options),
    listConfigs: async () => formatConfigManifests(),
  };
}

async function pullSkills(
  names: string[],
  options: SkillServiceOptions,
  paths: ReturnType<typeof getProjectPaths>,
): Promise<string> {
  await initializeProject(paths, options.integrations);
  const skills = selectSkills(
    await discoverSkills(options.skillsDirectory, options.packageVersion),
    names,
  );
  const result = await installSkills(
    skills,
    paths,
    await readState(paths.state, options.packageVersion),
    options.packageVersion,
    options.integrations,
  );
  await writeState(paths.state, result.state);
  return formatInstall("Pulled", result);
}

async function updateSkills(
  options: SkillServiceOptions,
  paths: ReturnType<typeof getProjectPaths>,
): Promise<string> {
  const state = await readState(paths.state, options.packageVersion);
  const skills = (
    await discoverSkills(options.skillsDirectory, options.packageVersion)
  ).filter((skill) => state.skills[skill.name]);
  if (skills.length === 0) return "No Skills needed updated.";
  const result = await installSkills(
    skills,
    paths,
    state,
    options.packageVersion,
    options.integrations,
    true,
  );
  await writeState(paths.state, result.state);
  return formatInstall("Updated", result);
}

function selectSkills(skills: Skill[], names: string[]): Skill[] {
  if (names.length === 0) return skills;
  const selected = new Set<string>();
  for (const request of new Set(names)) {
    if (request.startsWith("@")) {
      const tag = request.slice(1);
      if (!isSkillTag(tag))
        throw new AiSkillsError(
          `Invalid Skill tag "${request}". Use @ followed by lowercase letters, numbers, and hyphens.`,
        );
      const taggedSkills = skills.filter((skill) => skill.tags.includes(tag));
      if (taggedSkills.length === 0)
        throw new AiSkillsError(
          `No Skills were found with tag "${tag}" in this ai-skills distribution.`,
        );
      taggedSkills.forEach((skill) => selected.add(skill.name));
      continue;
    }
    if (!isSkillName(request))
      throw new AiSkillsError(
        `Invalid skill name "${request}". Use lowercase letters, numbers, and hyphens.`,
      );
    if (!skills.some((skill) => skill.name === request))
      throw new AiSkillsError(
        `Skill "${request}" was not found in this ai-skills distribution.`,
      );
    selected.add(request);
  }
  return skills.filter((skill) => selected.has(skill.name));
}

async function getStatus(
  options: SkillServiceOptions,
  paths: ReturnType<typeof getProjectPaths>,
): Promise<string> {
  // Check project scope first
  let activePaths = paths;
  let activeState = await readState(paths.state, options.packageVersion);
  let scopeName = "project";

  if (Object.keys(activeState.skills).length === 0) {
    // Check global scope
    const globalPaths = getProjectPaths(os.homedir());
    const globalState = await readState(
      globalPaths.state,
      options.packageVersion,
    );
    if (Object.keys(globalState.skills).length > 0) {
      activePaths = globalPaths;
      activeState = globalState;
      scopeName = "global";
    }
  }

  const skills = await discoverSkills(
    options.skillsDirectory,
    options.packageVersion,
  );
  const rows = await Promise.all(
    skills.map((skill) => getStatusRow(skill, activeState, activePaths.skills)),
  );
  return rows.length === 0
    ? "No Skills are available in this distribution."
    : `Installed Skills (${scopeName} scope)\n\n${rows
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((row) => `${row.name.padEnd(28)}  ${row.version.padEnd(8)}  ${row.status}`)
        .join("\n")}`;
}

async function getStatusRow(
  skill: Skill,
  state: SkillState,
  skillsPath: string,
): Promise<{ name: string; status: string; version: string }> {
  const installed = state.skills[skill.name];
  if (!installed)
    return { name: skill.name, status: "not installed", version: "-" };
  const destination = getSkillDestination(skillsPath, skill.name);
  if (
    !(await exists(destination)) ||
    (await checksumDirectory(destination)) !== installed.checksum
  )
    return {
      name: skill.name,
      status: "invalid/corrupt",
      version: installed.version,
    };
  return {
    name: skill.name,
    status: installed.version === skill.version ? "current" : "outdated",
    version: installed.version,
  };
}

async function pullConfiguration(
  targets: string[],
  options: SkillServiceOptions,
): Promise<string> {
  const { pulled } = await pullConfigs(
    targets,
    options.projectRoot,
    options.configsDirectory,
  );
  return `Successfully pulled configuration files:\n${pulled.map((p) => `  ✔ ${p}`).join("\n")}`;
}

function formatConfigManifests(): string {
  const entries = Object.values(CONFIG_MANIFESTS).map((item) => {
    const importText = item.modularImportSupported
      ? `Can import from: ${item.packageImportPath}`
      : "Does not support npm package modular imports; pull directly to workspace.";
    return `${item.name.toUpperCase()}\n  ${item.description}\n  ${importText}`;
  });

  return `Available Toolchain Configurations in Bobslab:\n\n${entries.join("\n\n")}\n\nTip: Run \`bobs-lab config pull <target>\` (or \`bobs-lab config pull all\`) to materialize them locally into your project.`;
}

function formatInstall(
  verb: string,
  result: { skipped: string[]; updated: string[] },
): string {
  const messages = [
    ...result.updated.map((name) => `${verb} ${name}.`),
    ...result.skipped.map((name) => `Skipped ${name}.`),
  ];
  return messages.length === 0
    ? `No Skills needed ${verb.toLowerCase()}.`
    : messages.join("\n");
}

export { discoverSkills } from "./registry.js";
