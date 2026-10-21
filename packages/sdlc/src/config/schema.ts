export interface SdlcConfig {
  version: string;
  enabledRuntimes: Array<"antigravity" | "codex">;
  defaultRuntime: "antigravity" | "codex";
  linear: {
    teamPrefix: string;
    workspaceSlug?: string;
  };
  github: {
    owner: string;
    repo: string;
    baseBranch: string;
    stagingBranch: string;
  };
  retries: {
    maxRetriesPerTask: number;
    backoffMs: number;
  };
  testIntegrity: {
    strictAssertions: boolean;
    failOnNewSkippedTests: boolean;
    enforceCoverageThresholds: boolean;
  };
  staging: {
    smokeTestEndpoint?: string;
    smokeTestTimeoutMs: number;
  };
}

export const DEFAULT_SDLC_CONFIG: SdlcConfig = {
  version: "1.0.0",
  enabledRuntimes: ["antigravity", "codex"],
  defaultRuntime: "antigravity",
  linear: {
    teamPrefix: "BOB",
    workspaceSlug: "bobslab",
  },
  github: {
    owner: "bobslab",
    repo: "bobslab",
    baseBranch: "main",
    stagingBranch: "staging",
  },
  retries: {
    maxRetriesPerTask: 3,
    backoffMs: 1000,
  },
  testIntegrity: {
    strictAssertions: true,
    failOnNewSkippedTests: true,
    enforceCoverageThresholds: true,
  },
  staging: {
    smokeTestTimeoutMs: 30000,
  },
};
