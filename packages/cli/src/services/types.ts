export interface Skill {
  description: string;
  filesDirectory: string;
  name: string;
  tags: string[];
  version: string;
}

export interface InstalledSkill {
  checksum: string;
  version: string;
}

export interface SkillState {
  packageVersion: string;
  schemaVersion: 1;
  skills: Record<string, InstalledSkill>;
}

export interface ProjectPaths {
  agents: string;
  gitignore: string;
  root: string;
  skills: string;
  state: string;
}

export type ConfigTarget = "zed" | "vscode" | "biome" | "prettier" | "eslint" | "typescript" | "all";

export interface ConfigManifest {
  name: string;
  description: string;
  modularImportSupported: boolean;
  packageImportPath?: string;
  destinations: Array<{
    sourceFile: string;
    destinationRelativePath: string;
  }>;
}
