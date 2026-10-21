import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

import { AiSkillsError } from "../core/errors.js";
import type { ConfigManifest, ConfigTarget } from "./types.js";

export const CONFIG_MANIFESTS: Record<
  Exclude<ConfigTarget, "all">,
  ConfigManifest
> = {
  zed: {
    name: "zed",
    description: "Zed editor settings (.zed/settings.json)",
    modularImportSupported: false,
    destinations: [
      {
        sourceFile: "zed/settings.json",
        destinationRelativePath: ".zed/settings.json",
      },
    ],
  },
  vscode: {
    name: "vscode",
    description:
      "VS Code workspace settings and recommended extensions (.vscode/)",
    modularImportSupported: false,
    destinations: [
      {
        sourceFile: "vscode/settings.json",
        destinationRelativePath: ".vscode/settings.json",
      },
      {
        sourceFile: "vscode/extensions.json",
        destinationRelativePath: ".vscode/extensions.json",
      },
    ],
  },
  prettier: {
    name: "prettier",
    description: "Prettier code formatting configuration (.prettierrc)",
    modularImportSupported: true,
    packageImportPath: "@bobslab/config/prettier",
    destinations: [
      {
        sourceFile: "prettier/.prettierrc",
        destinationRelativePath: ".prettierrc",
      },
    ],
  },
  eslint: {
    name: "eslint",
    description: "ESLint flat configuration (eslint.config.mjs)",
    modularImportSupported: true,
    packageImportPath: "@bobslab/config/eslint",
    destinations: [
      {
        sourceFile: "eslint/eslint.config.mjs",
        destinationRelativePath: "eslint.config.mjs",
      },
    ],
  },
  typescript: {
    name: "typescript",
    description: "TypeScript base configuration (tsconfig.json)",
    modularImportSupported: true,
    packageImportPath: "@bobslab/config/typescript/base.json",
    destinations: [
      {
        sourceFile: "typescript/tsconfig.json",
        destinationRelativePath: "tsconfig.json",
      },
    ],
  },
};

export async function pullConfigs(
  targets: string[],
  projectRoot: string,
  configsDirectory: string,
): Promise<{ pulled: string[] }> {
  const selectedTargets: Array<Exclude<ConfigTarget, "all">> = [];

  if (targets.length === 0 || targets.includes("all")) {
    selectedTargets.push(
      ...(Object.keys(CONFIG_MANIFESTS) as Array<Exclude<ConfigTarget, "all">>),
    );
  } else {
    for (const target of targets) {
      const lower = target.toLowerCase();
      if (!(lower in CONFIG_MANIFESTS)) {
        throw new AiSkillsError(
          `Unknown config target "${target}". Available: ${Object.keys(CONFIG_MANIFESTS).join(", ")}, all`,
        );
      }
      selectedTargets.push(lower as Exclude<ConfigTarget, "all">);
    }
  }

  const pulled: string[] = [];

  for (const key of selectedTargets) {
    const manifest = CONFIG_MANIFESTS[key];
    for (const item of manifest.destinations) {
      const src = path.join(configsDirectory, item.sourceFile);
      const dest = path.join(projectRoot, item.destinationRelativePath);
      await mkdir(path.dirname(dest), { recursive: true });
      await cp(src, dest, { force: true });
      pulled.push(item.destinationRelativePath);
    }
  }

  return { pulled };
}
