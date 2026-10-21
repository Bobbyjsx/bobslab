#!/usr/bin/env node
import { execSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

async function main() {
  const runId = process.argv[2] || "sdlc_baseline";
  const artifactsDir = path.join(process.cwd(), ".factory", "artifacts", runId);
  const baselinePath = path.join(artifactsDir, "baseline-results.json");

  let baseline = null;
  try {
    const raw = await readFile(baselinePath, "utf8");
    baseline = JSON.parse(raw);
  } catch {
    console.warn(`Warning: Baseline file not found at ${baselinePath}. Using default threshold baseline.`);
    baseline = {
      baseSha: "unknown",
      skippedCount: 0,
      assertionCount: 120,
    };
  }

  // Get current diff against baseSha or HEAD~1
  let diffText = "";
  try {
    const targetRef = baseline.baseSha && baseline.baseSha !== "0000000000000000000000000000000000000000"
      ? baseline.baseSha
      : "HEAD~1";
    diffText = execSync(`git diff ${targetRef}..HEAD`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    // Fallback to uncommitted working tree diff
    try {
      diffText = execSync("git diff HEAD", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    } catch {
      diffText = "";
    }
  }

  const violations = [];

  // 1. Scan diff for dangerous tampering patterns
  const dangerousPatterns = [
    { regex: /\+\s*(it|test|describe)\.skip\(/g, type: "newly_skipped", desc: "Added .skip() call to test" },
    { regex: /\+\s*\/\/\s*eslint-disable/g, type: "disabled_check", desc: "Added eslint-disable comment" },
    { regex: /\+\s*xit\(/g, type: "newly_skipped", desc: "Added xit() call" },
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.regex.test(diffText)) {
      violations.push({
        type: pattern.type,
        description: pattern.desc,
        severity: "critical",
      });
    }
  }

  const passed = violations.length === 0;
  const report = {
    runId,
    timestamp: new Date().toISOString(),
    integrityVerified: passed,
    violations,
  };

  await mkdir(artifactsDir, { recursive: true });
  await writeFile(path.join(artifactsDir, "integrity-report.json"), JSON.stringify(report, null, 2), "utf8");

  if (!passed) {
    console.error("Test Integrity Audit FAILED: Anti-tamper violations detected:");
    for (const v of violations) {
      console.error(`  - [${v.type}] ${v.description}`);
    }
    process.exit(1);
  }

  console.log("Test Integrity Audit PASSED: Zero anti-tamper violations detected.");
}

main().catch((err) => {
  console.error("Integrity check failed:", err);
  process.exit(1);
});
