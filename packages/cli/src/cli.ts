import { Command } from "commander";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { registerCommands } from "./commands/register.js";
import { AiSkillsError } from "./core/errors.js";
import { consoleOutput, type Output } from "./core/output.js";
import type { SkillService } from "./services/skills.js";

interface CliDependencies {
  output?: Output;
  service?: SkillService;
  version?: string;
}

/** Creates the configured command program. */
export const createProgram = (dependencies: CliDependencies = {}): Command => {
  const output = dependencies.output ?? consoleOutput;
  const program = new Command();
  const version = dependencies.version ?? readPackageVersion();

  program
    .name("bobs-lab")
    .description(
      "The official Bobslab CLI for distributing AI agent skills and workspace toolchain configs",
    )
    .version(version)
    .showHelpAfterError()
    .showSuggestionAfterError();

  const baseOptions = {
    packageVersion: version,
    projectRoot: process.cwd(),
    skillsDirectory: getSkillsDirectory(),
    configsDirectory: getConfigsDirectory(),
  };

  registerCommands(program, baseOptions, output, dependencies.service);
  program.addHelpText(
    "after",
    "\nExamples:\n  bobs-lab skills pull @frontend\n  bobs-lab skills pull @sdlc\n  bobs-lab skills list\n  bobs-lab config pull zed\n  bobs-lab config list\n",
  );

  return program;
};

/** Runs the CLI and translates expected errors into terminal feedback. */
export const runCli = async (argumentsList: string[]): Promise<void> => {
  try {
    const program = createProgram();

    if (argumentsList.length === 0) {
      program.outputHelp();
      return;
    }

    await program.parseAsync(argumentsList, { from: "user" });
  } catch (error) {
    if (error instanceof AiSkillsError) {
      consoleOutput.error(error.message);
      process.exitCode = 1;
      return;
    }

    if (error instanceof Error && error.name === "ExitPromptError") {
      consoleOutput.info("\nAborted.");
      process.exitCode = 0;
      return;
    }

    throw error;
  }
};

/** Resolves the bundled Skill asset directory. */
const getSkillsDirectory = (): string =>
  fileURLToPath(new URL("../skills/", import.meta.url));

/** Resolves the bundled Config asset directory. */
const getConfigsDirectory = (): string =>
  fileURLToPath(new URL("../configs/", import.meta.url));

/** Reads the package version used by the CLI banner and state file. */
const readPackageVersion = (): string => {
  const packagePath = fileURLToPath(
    new URL("../package.json", import.meta.url),
  );
  const packageContent: unknown = JSON.parse(readFileSync(packagePath, "utf8"));
  if (!isPackageMetadata(packageContent))
    throw new Error(`Could not read a version from ${packagePath}.`);
  return packageContent.version;
};

/** Narrows package metadata to the runtime fields the CLI needs. */
const isPackageMetadata = (value: unknown): value is { version: string } =>
  typeof value === "object" &&
  value !== null &&
  "version" in value &&
  typeof value.version === "string";

const isDirectExecution = (): boolean => {
  const entryPath = process.argv[1];
  return (
    entryPath !== undefined &&
    realpathSync(path.resolve(entryPath)) ===
      realpathSync(fileURLToPath(import.meta.url))
  );
};

if (isDirectExecution()) {
  void runCli(process.argv.slice(2));
}

export { createSkillService, discoverSkills } from "./services/skills.js";
