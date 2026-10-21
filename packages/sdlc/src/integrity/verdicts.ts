import type { QAReport, QAVerdict, TestIntegrityViolation } from "../core/types.js";

export class QAVerdictEvaluator {
  evaluateVerdict(params: {
    runId: string;
    testedSha: string;
    unitTests: { passed: number; failed: number; skipped: number; logs: string };
    lintPassed: boolean;
    typeCheckPassed: boolean;
    integrityViolations: TestIntegrityViolation[];
    environmentBlocked?: boolean;
    blockReason?: string;
  }): QAReport {
    const timestamp = new Date().toISOString();

    if (params.environmentBlocked) {
      return {
        runId: params.runId,
        testedSha: params.testedSha,
        timestamp,
        verdict: "BLOCKED",
        evidence: {
          unitTests: params.unitTests,
          lintPassed: params.lintPassed,
          typeCheckPassed: params.typeCheckPassed,
          integrityVerified: false,
          integrityViolations: [params.blockReason || "Execution environment blocked"],
        },
        summary: `QA Verification BLOCKED: ${params.blockReason || "External dependency or environment issue."}`,
      };
    }

    const hasTestFailures = params.unitTests.failed > 0;
    const hasIntegrityViolations = params.integrityViolations.length > 0;
    const hasStaticFailures = !params.lintPassed || !params.typeCheckPassed;

    const verdict: QAVerdict =
      hasTestFailures || hasIntegrityViolations || hasStaticFailures ? "FAIL" : "PASS";

    const violationSummaries = params.integrityViolations.map((v) => v.description);

    return {
      runId: params.runId,
      testedSha: params.testedSha,
      timestamp,
      verdict,
      evidence: {
        unitTests: params.unitTests,
        lintPassed: params.lintPassed,
        typeCheckPassed: params.typeCheckPassed,
        integrityVerified: !hasIntegrityViolations,
        integrityViolations: violationSummaries,
      },
      summary:
        verdict === "PASS"
          ? `All ${params.unitTests.passed} unit checks and test integrity passed on commit ${params.testedSha.substring(0, 7)}.`
          : `QA checks failed on commit ${params.testedSha.substring(0, 7)}: ${[
              hasTestFailures ? `${params.unitTests.failed} unit test failures` : null,
              hasIntegrityViolations ? `${params.integrityViolations.length} test integrity violations` : null,
              !params.typeCheckPassed ? "Type check failure" : null,
              !params.lintPassed ? "Lint failure" : null,
            ]
              .filter(Boolean)
              .join(", ")}.`,
    };
  }
}
