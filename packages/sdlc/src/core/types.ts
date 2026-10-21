export type WorkflowState =
  | "INTAKE"
  | "DISCOVERY"
  | "AWAITING_PLAN_APPROVAL"
  | "PLANNING_ONLY"
  | "DECOMPOSITION"
  | "IMPLEMENTATION"
  | "TEST_AUTHORING"
  | "QA"
  | "TRIAGE"
  | "BLOCKED"
  | "AWAITING_HUMAN"
  | "READY_FOR_HUMAN_REVIEW"
  | "AWAITING_STORY_APPROVAL"
  | "RELEASE"
  | "STAGING_VERIFICATION"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type RunMode = "planning" | "implementation";

export type AgentRole =
  | "orchestrator"
  | "architect"
  | "implementer"
  | "test-engineer"
  | "qa-agent"
  | "triage-agent"
  | "release-agent";

export type QAVerdict = "PASS" | "FAIL" | "BLOCKED";

export interface ApprovalRecord {
  gate: "PLAN" | "STORY";
  approved: boolean;
  timestamp: string;
  approver: string;
  notes?: string;
  candidateSha?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedRole: AgentRole;
  dependencies: string[];
  status: "pending" | "in_progress" | "completed" | "failed" | "blocked";
  branch?: string;
  worktreePath?: string;
  prUrl?: string;
  prNumber?: number;
  candidateSha?: string;
  retryCount: number;
  maxRetries: number;
}

export interface StoryDefinition {
  id: string;
  linearId?: string;
  title: string;
  problemStatement: string;
  desiredOutcome: string;
  requirements: string[];
  acceptanceCriteria: string[];
  inScope: string[];
  outOfScope: string[];
  affectedModules: string[];
  tasks: TaskItem[];
}

export interface QAReport {
  runId: string;
  testedSha: string;
  timestamp: string;
  verdict: QAVerdict;
  evidence: {
    unitTests: { passed: number; failed: number; skipped: number; logs: string };
    lintPassed: boolean;
    typeCheckPassed: boolean;
    integrityVerified: boolean;
    integrityViolations: string[];
  };
  summary: string;
}

export interface TestIntegrityBaseline {
  baseSha: string;
  timestamp: string;
  suiteCount: number;
  testCount: number;
  skippedCount: number;
  assertionCount: number;
  coverageThresholds?: Record<string, number>;
}

export interface TestIntegrityViolation {
  file: string;
  type: "removed_assertion" | "relaxed_expectation" | "newly_skipped" | "disabled_check" | "reduced_coverage";
  description: string;
  severity: "high" | "critical";
}

export interface TriageRecord {
  runId: string;
  qaReportTimestamp: string;
  rootCauseCategory: "implementation_defect" | "test_defect" | "environment_failure" | "requirement_ambiguity";
  analysis: string;
  recommendedAction: string;
  targetRole: AgentRole;
  retryCount: number;
}

export interface ReleaseManifest {
  runId: string;
  storyId: string;
  timestamp: string;
  targetEnvironment: "staging";
  mergedPrs: Array<{ prNumber: number; sha: string }>;
  stagingDeploymentId: string;
  smokeTestsPassed: boolean;
  verifiedBy: string;
}

export interface WorkflowRun {
  runId: string;
  objective: string;
  state: WorkflowState;
  mode: RunMode;
  createdAt: string;
  updatedAt: string;
  story: StoryDefinition;
  approvals: {
    plan?: ApprovalRecord;
    story?: ApprovalRecord;
  };
  activeWorkers: Record<string, { role: AgentRole; sessionId: string; startedAt: string }>;
  qaReports: QAReport[];
  triageRecords: TriageRecord[];
  releaseManifest?: ReleaseManifest;
  idempotencyKeys: Record<string, string>;
  error?: string;
}

export interface AuditEvent {
  id: string;
  runId: string;
  timestamp: string;
  previousState: WorkflowState;
  nextState: WorkflowState;
  trigger: string;
  role: AgentRole | "system" | "human";
  commitSha?: string;
  metadata?: Record<string, unknown>;
}
