#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const prNumber = process.env.PR_NUMBER || process.argv[2];
const runNumber = process.env.RUN_NUMBER || process.argv[3] || "1";
const packagesJsonInput = process.env.PACKAGES_JSON || process.argv[4] || "[]";
const githubOutput = process.env.GITHUB_OUTPUT;

if (!prNumber) {
  console.error("Missing PR_NUMBER environment variable or argument.");
  process.exit(1);
}

const packages = JSON.parse(packagesJsonInput);
const updatedPackages = [];

for (const pkg of packages) {
  const pkgJsonPath = path.join(pkg.directory, "package.json");
  const pkgData = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

  // Strip any pre-existing prerelease tag before appending PR tag
  const baseVersion = pkgData.version.split("-")[0];
  const testVersion = `${baseVersion}-pr.${prNumber}.${runNumber}`;

  pkgData.version = testVersion;
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgData, null, 2) + "\n");

  updatedPackages.push({
    name: pkg.name,
    directory: pkg.directory,
    baseVersion,
    testVersion,
  });
}

console.log(
  `Updated ${updatedPackages.length} packages for PR #${prNumber} (Run #${runNumber}):`,
);
console.table(updatedPackages);

// Generate Markdown table for GitHub PR comment
let commentMarkdown = `### 🧪 Bobslab Prerelease Test Build\n\n`;
commentMarkdown += `Test packages have been published to npm under the \`test\` tag for PR #${prNumber} (Run #${runNumber}):\n\n`;
commentMarkdown += `| Package | Prerelease Version | Install Command |\n`;
commentMarkdown += `| :--- | :--- | :--- |\n`;

for (const p of updatedPackages) {
  commentMarkdown += `| \`${p.name}\` | \`${p.testVersion}\` | \`pnpm add ${p.name}@${p.testVersion}\` |\n`;
}

commentMarkdown += `\n> **Note:** These builds are published with \`--tag test\` and will not affect the \`latest\` production release.\n`;

if (githubOutput) {
  // Use multiline output format for GitHub Actions
  const delimiter = `DELIMITER_${Date.now()}`;
  fs.appendFileSync(
    githubOutput,
    `comment_markdown<<${delimiter}\n${commentMarkdown}\n${delimiter}\n`,
  );
  fs.appendFileSync(
    githubOutput,
    `updated_packages_json=${JSON.stringify(updatedPackages)}\n`,
  );
}
