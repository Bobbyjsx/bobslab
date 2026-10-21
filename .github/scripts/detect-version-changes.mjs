#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

let baseRef = process.env.BASE_REF || process.argv[2] || "HEAD~1";
const headRef = process.env.HEAD_REF || "HEAD";
const githubOutput = process.env.GITHUB_OUTPUT;

// Handle empty or zero SHA (e.g. on new branch push)
if (!baseRef || /^0+$/.test(baseRef)) {
  baseRef = "HEAD~1";
}

function getPackageVersionAtRef(ref, pkgJsonPath) {
  try {
    const raw = execFileSync("git", ["show", `${ref}:${pkgJsonPath}`], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    return JSON.parse(raw).version;
  } catch {
    return null;
  }
}

const packagesDir = "packages";
const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
const changedPackages = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const pkgJsonPath = path.join(packagesDir, entry.name, "package.json");
  if (!fs.existsSync(pkgJsonPath)) continue;

  const currentPkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  if (currentPkg.private) continue;

  const prevVersion = getPackageVersionAtRef(baseRef, pkgJsonPath);
  const currentVersion = currentPkg.version;

  // We consider a package changed if previous version is different or if it is a new package
  if (prevVersion === null || prevVersion !== currentVersion) {
    changedPackages.push({
      name: currentPkg.name,
      directory: path.join(packagesDir, entry.name),
      previousVersion: prevVersion,
      newVersion: currentVersion,
    });
  }
}

const hasChanges = changedPackages.length > 0;
const packageNames = changedPackages.map((p) => p.name).join(" ");
const packagesJson = JSON.stringify(changedPackages);

console.log(`Base ref: ${baseRef}`);
console.log(`Changed packages (${changedPackages.length}):`, changedPackages);

if (githubOutput) {
  fs.appendFileSync(githubOutput, `has_changes=${hasChanges}\n`);
  fs.appendFileSync(githubOutput, `packages_count=${changedPackages.length}\n`);
  fs.appendFileSync(githubOutput, `package_names=${packageNames}\n`);
  fs.appendFileSync(githubOutput, `packages_json=${packagesJson}\n`);
}
