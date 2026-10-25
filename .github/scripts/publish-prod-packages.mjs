#!/usr/bin/env node
import { execSync } from "node:child_process";

const packagesJson = process.env.PACKAGES_JSON || "[]";
const pkgs = JSON.parse(packagesJson);

for (const p of pkgs) {
  console.log(`\n========================================`);
  console.log(`Publishing OIDC production release: ${p.name}@${p.newVersion}`);
  console.log(`========================================\n`);

  try {
    const res = execSync(
      `pnpm --filter "${p.name}" publish --access public --provenance --no-git-checks`,
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    console.log(res);
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
        `Package ${p.name}@${p.newVersion} is already published or staged on npm. Continuing.`,
      );
    } else if (
      full.includes("ENEEDAUTH") ||
      full.includes("need auth") ||
      full.includes("You need to authorize")
    ) {
      console.error(
        `\n❌ [OIDC Trusted Publishing Missing]\n` +
          `Package ${p.name} cannot be published because tokenless OIDC Trusted Publishing is not configured on npmjs.com.\n` +
          `Please configure a Trusted Publisher for this package at:\n` +
          `https://www.npmjs.com/package/${p.name}/access\n` +
          `  - Provider: GitHub Actions\n` +
          `  - Owner / Repository: Bobbyjsx/bobslab\n` +
          `  - Workflow: .github/workflows/deploy-packages.yml\n`,
      );
      throw new Error(
        `Package ${p.name} lacks OIDC Trusted Publishing configuration on npmjs.com`,
      );
    } else {
      throw err;
    }
  }
}
