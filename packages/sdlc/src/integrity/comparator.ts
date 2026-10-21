import type { TestIntegrityBaseline, TestIntegrityViolation } from "../core/types.js";

export class TestIntegrityComparator {
  /**
   * Compares baseline test metrics and candidate file diffs to detect tampering.
   */
  detectViolations(
    baseline: TestIntegrityBaseline,
    candidateMetrics: {
      suiteCount: number;
      testCount: number;
      skippedCount: number;
      assertionCount: number;
      coverageThresholds?: Record<string, number>;
    },
    diffText: string = "",
  ): TestIntegrityViolation[] {
    const violations: TestIntegrityViolation[] = [];

    // 1. Check for newly skipped tests
    if (candidateMetrics.skippedCount > baseline.skippedCount) {
      violations.push({
        file: "tests",
        type: "newly_skipped",
        description: `Newly skipped tests detected (baseline: ${baseline.skippedCount}, candidate: ${candidateMetrics.skippedCount})`,
        severity: "critical",
      });
    }

    // 2. Check for reduced assertion counts
    if (candidateMetrics.assertionCount < baseline.assertionCount) {
      violations.push({
        file: "tests",
        type: "removed_assertion",
        description: `Assertion count decreased from ${baseline.assertionCount} to ${candidateMetrics.assertionCount}`,
        severity: "critical",
      });
    }

    // 3. Check for loosened coverage thresholds
    if (baseline.coverageThresholds && candidateMetrics.coverageThresholds) {
      for (const [key, baseVal] of Object.entries(baseline.coverageThresholds)) {
        const candVal = candidateMetrics.coverageThresholds[key];
        if (candVal !== undefined && candVal < baseVal) {
          violations.push({
            file: "coverageConfig",
            type: "reduced_coverage",
            description: `Coverage threshold for "${key}" reduced from ${baseVal}% to ${candVal}%`,
            severity: "critical",
          });
        }
      }
    }

    // 4. Scan diff for dangerous tampering patterns (.skip, disabled eslint, commented assertions)
    const dangerousPatterns = [
      { regex: /\+\s*(it|test|describe)\.skip\(/g, type: "newly_skipped" as const, desc: "Added .skip() call to test" },
      { regex: /\+\s*\/\/\s*eslint-disable/g, type: "disabled_check" as const, desc: "Added eslint-disable comment" },
      { regex: /\+\s*xit\(/g, type: "newly_skipped" as const, desc: "Added xit() call" },
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.regex.test(diffText)) {
        violations.push({
          file: "diff",
          type: pattern.type,
          description: pattern.desc,
          severity: "critical",
        });
      }
    }

    return violations;
  }
}
