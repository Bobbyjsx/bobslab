#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";

const updatedPackagesJson = process.env.UPDATED_PACKAGES_JSON || "[]";
const prNumber = process.env.PR_NUMBER;
const runNumber = process.env.RUN_NUMBER;
const githubOutput = process.env.GITHUB_OUTPUT;

const pkgs = JSON.parse(updatedPackagesJson);
const published = [];
const skipped = [];

for (const p of pkgs) {
  console.log(`\n========================================`);
  console.log(`Publishing OIDC test release: ${p.name}@${p.testVersion}`);
  console.log(`========================================\n`);

  try {
    const res = execSync(
      `pnpm --filter "${p.name}" publish --tag test --access public --no-git-checks`,
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    console.log(res);
    published.push(p);
  } catch (err) {
    const stdout = err.stdout ? err.stdout.toString() : "";
    const stderr = err.stderr ? err.stderr.toString() : "";
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    const full = `${stdout} ${stderr} ${err.message || ""}`;

    if (
      full.includes("previously published") ||
      full.includes("Cannot publish over") ||
      full.includes("E403") ||
      full.includes("E409")
    ) {
      console.warn(
        `Test package ${p.name}@${p.testVersion} is already published or staged on npm. Continuing.`,
      );
      published.push(p);
    } else if (
      full.includes("ENEEDAUTH") ||
      full.includes("need auth") ||
      full.includes("You need to authorize")
    ) {
      console.warn(
        `\n⚠️ [OIDC Trusted Publishing Notice]\n` +
          `Package ${p.name} does not have GitHub Actions OIDC Trusted Publishing configured on npmjs.com yet.\n` +
          `To enable automated test and production releases, visit:\n` +
          `https://www.npmjs.com/package/${p.name}/access\n` +
          `and add a Trusted Publisher with:\n` +
          `  - Provider: GitHub Actions\n` +
          `  - Owner / Repository: Bobbyjsx/bobslab\n` +
          `  - Workflow: .github/workflows/deploy-packages.yml\n` +
          `Skipping test publication for ${p.name} on this PR.\n`,
      );
      skipped.push({
        ...p,
        reason: "npm OIDC Trusted Publishing not yet configured",
      });
    } else {
      throw err;
    }
  }
}

// Generate Markdown table for GitHub PR comment
let commentMarkdown = `### 🧪 Bobslab Prerelease Test Build\n\n`;

if (published.length > 0) {
  commentMarkdown += `Test packages have been published to npm under the \`test\` tag for PR #${prNumber} (Run #${runNumber}):\n\n`;
  commentMarkdown += `| Package | Prerelease Version | Install Command |\n`;
  commentMarkdown += `| :--- | :--- | :--- |\n`;
  for (const p of published) {
    commentMarkdown += `| \`${p.name}\` | \`${p.testVersion}\` | \`pnpm add ${p.name}@${p.testVersion}\` |\n`;
  }
  commentMarkdown += `\n> **Note:** These builds are published with \`--tag test\` and will not affect the \`latest\` production release.\n\n`;
}

if (skipped.length > 0) {
  commentMarkdown += `#### ℹ️ Pending npm OIDC Trusted Publishing Setup\n\n`;
  commentMarkdown += `The following packages were skipped because OIDC Trusted Publishing has not yet been configured on npm:\n\n`;
  for (const s of skipped) {
    commentMarkdown += `- \`${s.name}\`: Configure at [npmjs.com/package/${s.name}/access](https://www.npmjs.com/package/${s.name}/access) (Owner: \`Bobbyjsx/bobslab\`, Workflow: \`.github/workflows/deploy-packages.yml\`).\n`;
  }
}

if (githubOutput) {
  const delimiter = `DELIMITER_${Date.now()}`;
  fs.appendFileSync(
    githubOutput,
    `comment_markdown<<${delimiter}\n${commentMarkdown}\n${delimiter}\n`,
  );
  fs.appendFileSync(
    githubOutput,
    `published_packages_json=${JSON.stringify(published)}\n`,
  );
  fs.appendFileSync(githubOutput, `has_published=${published.length > 0}\n`);
}
