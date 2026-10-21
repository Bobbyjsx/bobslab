export interface CIRunResult {
  runId: string;
  commitSha: string;
  status: "success" | "failure" | "in_progress";
  checks: {
    lint: boolean;
    typeCheck: boolean;
    unitTests: boolean;
    build: boolean;
  };
  durationMs: number;
}

export class CIIntegration {
  async runChecksForSha(commitSha: string, simulateFailure = false): Promise<CIRunResult> {
    if (simulateFailure) {
      return {
        runId: `ci_${Date.now()}`,
        commitSha,
        status: "failure",
        checks: {
          lint: true,
          typeCheck: false,
          unitTests: false,
          build: false,
        },
        durationMs: 1250,
      };
    }

    return {
      runId: `ci_${Date.now()}`,
      commitSha,
      status: "success",
      checks: {
        lint: true,
        typeCheck: true,
        unitTests: true,
        build: true,
      },
      durationMs: 3420,
    };
  }

  async runStagingSmokeTests(deploymentId: string, simulateFailure = false): Promise<boolean> {
    return !simulateFailure;
  }
}
