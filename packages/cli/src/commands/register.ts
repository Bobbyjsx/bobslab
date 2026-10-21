import { checkbox, confirm, select } from "@inquirer/prompts";
import { Command } from "commander";
import os from "node:os";
import { AiSkillsError } from "../core/errors.js";
import type { Output } from "../core/output.js";
import { isSkillName, isSkillTag } from "../services/registry.js";
import {
  createSkillService,
  type SkillService,
  type SkillServiceOptions,
} from "../services/skills.js";
import { getLatestPackageVersion, isNewerVersion } from "../utils/update.js";

const BOBSLAB_LOGO = `
   ____        _           _       _     
  |  _ \\      | |         | |     | |    
  | |_) | ___ | |__   ___ | | __ _| |__  
  |  _ < / _ \\| '_ \\ / __|| |/ _\` | '_ \\ 
  | |_) | (_) | |_) |\\__ \\| | (_| | |_) |
  |____/ \\___/|_.__/ |___/|_|\\__,_|_.__/ 

   The official CLI for distributing Bobslab AI coding-agent skills & configs.
`;

interface CommandOptions {
  yes?: boolean;
  scope?: "project" | "global";
  integrations?: string[];
}

/** Collects interactive installation scope and integration preferences. */
const resolvePreferences = async (
  options: SkillServiceOptions,
  cmdOptions: CommandOptions = {},
  askScope: boolean = true,
): Promise<{ integrations: string[]; root: string; scope: string }> => {
  const defaultIntegrations = ["antigravity", "cursor", "claude", "codex"];

  if (cmdOptions.yes) {
    const scope = cmdOptions.scope ?? "project";
    const root = scope === "global" ? os.homedir() : options.projectRoot;
    const integrations = cmdOptions.integrations ?? defaultIntegrations;
    return { root, scope, integrations };
  }

  // If running in non-TTY environment (e.g. CI/script), default to project and all integrations
  if (!process.stdin.isTTY) {
    const scope = cmdOptions.scope ?? "project";
    const root = scope === "global" ? os.homedir() : options.projectRoot;
    const integrations = cmdOptions.integrations ?? defaultIntegrations;
    return { root, scope, integrations };
  }

  console.log(BOBSLAB_LOGO);

  const latestVersion = await getLatestPackageVersion("@bobslab/cli");
  if (latestVersion && isNewerVersion(latestVersion, options.packageVersion)) {
    console.log(
      `\n\x1b[33mUpdate Available! \x1b[0m(v${options.packageVersion} -> v${latestVersion})`,
    );
    const proceed = await confirm({
      message:
        "A newer version of @bobslab/cli is available. Do you want to proceed anyway?",
      default: true,
    });
    if (!proceed) {
      console.log("Aborted. Please run your package manager to update.");
      process.exit(0);
    }
  }

  const handleEsc = (data: Buffer) => {
    if (data.toString() === "\x1b") {
      console.log("\nAborted.");
      process.exit(0);
    }
  };
  process.stdin.on("data", handleEsc);

  let scope = cmdOptions.scope ?? "project";
  try {
    if (askScope && !cmdOptions.scope) {
      scope = await select({
        message:
          "Should this installation be globally scoped or project scoped?",
        choices: [
          { name: "Project Scoped", value: "project" },
          { name: "Globally Scoped", value: "global" },
        ],
      });
    }

    const integrations =
      cmdOptions.integrations ??
      (await checkbox({
        message: "Which agent integrations would you like to configure?",
        choices: [
          {
            name: "Antigravity CLI (.agents/skills.json)",
            value: "antigravity",
            checked: true,
          },
          { name: "Cursor (.cursor/rules)", value: "cursor", checked: true },
          {
            name: "Claude Code (.claude/skills)",
            value: "claude",
            checked: true,
          },
          { name: "Codex CLI (.codex/skills)", value: "codex", checked: true },
        ],
      }));

    const root = scope === "global" ? os.homedir() : options.projectRoot;
    return { root, scope, integrations };
  } finally {
    process.stdin.off("data", handleEsc);
  }
};

/** Registers all supported CLI commands on the Commander program. */
export const registerCommands = (
  program: Command,
  baseOptions: SkillServiceOptions,
  output: Output,
  serviceOverride?: SkillService,
): void => {
  const getService = () => serviceOverride ?? createSkillService(baseOptions);

  const initHandler = async (cmdOptions: CommandOptions) => {
    const prefs = await resolvePreferences(baseOptions, cmdOptions, false);
    const service = createSkillService({
      ...baseOptions,
      projectRoot: prefs.root,
      integrations: prefs.integrations,
    });
    output.info(await service.init());
  };

  const listHandler = async () => {
    const service = getService();
    output.info(formatSkillsList(await service.list()));
  };

  const pullHandler = async (
    skillNames: string[],
    cmdOptions: CommandOptions,
  ) => {
    const invalidRequest = skillNames.find((name) => {
      const value = name.startsWith("@") ? name.slice(1) : name;
      return name.startsWith("@") ? !isSkillTag(value) : !isSkillName(value);
    });
    if (invalidRequest)
      throw new AiSkillsError(
        invalidRequest.startsWith("@")
          ? `Invalid Skill tag "${invalidRequest}". Use @ followed by lowercase letters, numbers, and hyphens.`
          : `Invalid skill name "${invalidRequest}". Use lowercase letters, numbers, and hyphens.`,
      );
    const prefs = await resolvePreferences(baseOptions, cmdOptions, true);
    const service = createSkillService({
      ...baseOptions,
      projectRoot: prefs.root,
      integrations: prefs.integrations,
    });
    output.info(await service.pull(skillNames));
  };

  const statusHandler = async () => {
    const service = getService();
    output.info(await service.status());
  };

  const updateHandler = async (cmdOptions: CommandOptions) => {
    const prefs = await resolvePreferences(baseOptions, cmdOptions, true);
    const service = createSkillService({
      ...baseOptions,
      projectRoot: prefs.root,
      integrations: prefs.integrations,
    });
    output.info(await service.update());
  };

  // 1. SKILLS SUBCOMMAND GROUP (bobs-lab skills pull, bobs-lab skills list)
  const skillsCommand = program
    .command("skills")
    .description("Manage and materialize Bobslab AI coding-agent skills");

  skillsCommand
    .command("pull [skills...]")
    .description(
      "Materialize bundled Skills by name or @tag (e.g. @frontend, @sdlc)",
    )
    .option(
      "-y, --yes",
      "Skip prompts and pull skills using project-level settings",
    )
    .option("--scope <scope>", "Installation scope: project or global")
    .addHelpText(
      "after",
      "\nExamples:\n  bobs-lab skills pull @frontend\n  bobs-lab skills pull @sdlc\n  bobs-lab skills pull antislop-code\n",
    )
    .action(pullHandler);

  skillsCommand
    .command("list")
    .description("List skills bundled with this Bobslab distribution")
    .action(listHandler);

  skillsCommand
    .command("init")
    .description("Initialize skills configuration in the current project")
    .option("-y, --yes", "Skip prompts and use default project-level settings")
    .option("--scope <scope>", "Installation scope: project or global")
    .action(initHandler);

  skillsCommand
    .command("status")
    .description("Show the local skills installation status")
    .action(statusHandler);

  skillsCommand
    .command("update")
    .description("Update locally materialized skills")
    .option("-y, --yes", "Skip prompts and update skills")
    .action(updateHandler);

  // 2. CONFIG SUBCOMMAND GROUP (bobs-lab config pull, bobs-lab config list)
  const configCommand = program
    .command("config")
    .description(
      "Manage and pull Bobslab toolchain configurations (Zed, VSCode, Biome, Prettier, ESLint, TypeScript)",
    );

  configCommand
    .command("list")
    .description(
      "List available toolchain configs and their distribution types",
    )
    .action(async () => {
      const service = getService();
      output.info(await service.listConfigs());
    });

  configCommand
    .command("pull [targets...]")
    .description(
      "Pull toolchain config files directly into the workspace (e.g. zed, vscode, biome, prettier, eslint, typescript, all)",
    )
    .addHelpText(
      "after",
      "\nExamples:\n  bobs-lab config pull zed\n  bobs-lab config pull vscode\n  bobs-lab config pull all\n",
    )
    .action(async (targets: string[]) => {
      const service = getService();
      output.info(await service.pullConfig(targets));
    });

  // Top-level aliases for backwards compatibility
  program
    .command("pull [skills...]", { hidden: true })
    .option(
      "-y, --yes",
      "Skip prompts and pull skills using project-level settings",
    )
    .option("--scope <scope>", "Installation scope: project or global")
    .action(pullHandler);

  program.command("list", { hidden: true }).action(listHandler);

  program
    .command("init", { hidden: true })
    .option("-y, --yes")
    .option("--scope <scope>")
    .action(initHandler);

  program.command("status", { hidden: true }).action(statusHandler);

  program
    .command("update", { hidden: true })
    .option("-y, --yes")
    .action(updateHandler);
};

/** Formats Skill metadata for concise terminal output. */
const formatSkillsList = (
  skills: Array<{ description: string; name: string; tags: string[] }>,
): string => {
  if (skills.length === 0) {
    return "No Skills are available in this distribution.";
  }

  const entries = [...skills]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((skill) => {
      const tags =
        skill.tags.length > 0 ? `\n  Tags: ${skill.tags.join(", ")}` : "";
      return `${skill.name}\n  ${skill.description}${tags}`;
    });

  return `Available Skills in Bobslab\n\n${entries.join("\n\n")}`;
};
