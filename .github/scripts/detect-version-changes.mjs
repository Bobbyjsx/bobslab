#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

let rawBaseRef = process.env.BASE_REF || process.argv[2] || "HEAD~1";
const headRef = process.env.HEAD_REF || "HEAD";
const githubOutput = process.env.GITHUB_OUTPUT;

function resolveCommit(ref) {
  if (!ref || /^0+$/.test(ref)) return null;
  try {
    return execFileSync("git", ["rev-parse", "--verify", `${ref}^{commit}`], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function getMergeBase(refA, refB) {
  try {
    return execFileSync("git", ["merge-base", refA, refB], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

// 1. Resolve base ref commit SHA
let baseSha = resolveCommit(rawBaseRef);

// 2. If valid, compute merge-base with headRef so PR branch differences work accurately
if (baseSha) {
  const commonAncestor = getMergeBase(baseSha, headRef);
  if (commonAncestor) {
    baseSha = commonAncestor;
  }
} else {
  baseSha = resolveCommit("HEAD~1");
}

function getPackageVersionAtRef(ref, pkgJsonPath) {
  if (!ref) return null;
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

function sortTopologically(packages) {
  const pkgMap = new Map();
  for (const p of packages) {
    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(p.directory, "package.json"), "utf8"),
    );
    const deps = new Set(
      Object.keys({
        ...pkgJson.dependencies,
        ...pkgJson.peerDependencies,
      }).filter((k) => k.startsWith("@bobslab/")),
    );
    pkgMap.set(p.name, { ...p, deps });
  }

  const result = [];
  const visited = new Set();
  const visiting = new Set();

  function visit(name) {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      throw new Error(`Circular dependency detected at ${name}`);
    }
    visiting.add(name);
    const item = pkgMap.get(name);
    if (item) {
      for (const dep of item.deps) {
        if (pkgMap.has(dep)) {
          visit(dep);
        }
      }
      visited.add(name);
      result.push(item);
    }
    visiting.delete(name);
  }

  for (const p of packages) {
    visit(p.name);
  }
  return result.map(({ deps, ...rest }) => rest);
}

const packagesDir = "packages";
const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
const rawChanged = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const pkgJsonPath = path.join(packagesDir, entry.name, "package.json");
  if (!fs.existsSync(pkgJsonPath)) continue;

  const currentPkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  if (currentPkg.private) continue;

  const prevVersion = getPackageVersionAtRef(baseSha, pkgJsonPath);
  const currentVersion = currentPkg.version;

  // We consider a package changed if previous version is different or if it is a new package
  if (prevVersion === null || prevVersion !== currentVersion) {
    rawChanged.push({
      name: currentPkg.name,
      directory: path.join(packagesDir, entry.name),
      previousVersion: prevVersion,
      newVersion: currentVersion,
    });
  }
}

const changedPackages = sortTopologically(rawChanged);
const hasChanges = changedPackages.length > 0;
const packageNames = changedPackages.map((p) => p.name).join(" ");
const packagesJson = JSON.stringify(changedPackages);

console.log(`Base ref resolved: ${baseSha || "none (initial/unresolved)"}`);
console.log(`Changed packages (${changedPackages.length}):`, changedPackages);

if (githubOutput) {
  fs.appendFileSync(githubOutput, `has_changes=${hasChanges}\n`);
  fs.appendFileSync(githubOutput, `packages_count=${changedPackages.length}\n`);
  fs.appendFileSync(githubOutput, `package_names=${packageNames}\n`);
  fs.appendFileSync(githubOutput, `packages_json=${packagesJson}\n`);
}
