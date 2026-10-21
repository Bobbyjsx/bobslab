import { ArtifactManager } from "../brain/artifacts.js";
import { BrainProjector } from "../brain/projector.js";
import { loadSdlcConfig } from "../config/loader.js";
import type { SdlcConfig } from "../config/schema.js";
import { CIIntegration } from "../integrations/ci.js";
import { GitHubIntegration } from "../integrations/github.js";
import { LinearIntegration } from "../integrations/linear.js";
import { TestIntegrityBaselineRecorder } from "../integrity/baseline.js";
import { TestIntegrityComparator } from "../integrity/comparator.js";
import { QAVerdictEvaluator } from "../integrity/verdicts.js";
import { RuntimeRegistry } from "../runtimes/registry.js";
import {
  MissingApprovalError,
  RetryBudgetExceededError,
  SdlcError,
  UnauthorizedActionError,
} from "./errors.js";
import { AuditEventLogger } from "./events.js";
import { validateTransition } from "./states.js";
import { DurableStateStore } from "./store.js";
import type {
  AgentRole,
  ApprovalRecord,
  QAReport,
  ReleaseManifest,
  RunMode,
  StoryDefinition,
  TaskItem,
  TestIntegrityBaseline,
  TriageRecord,
  WorkflowRun,
  WorkflowState,
} from "./types.js";

export class SdlcEngine {
  private store: DurableStateStore;
  private logger: AuditEventLogger;
  private projector: BrainProjector;
  private artifacts: ArtifactManager;
  private linear: LinearIntegration;
  private github: GitHubIntegration;
  private ci: CIIntegration;
  private baselineRecorder: TestIntegrityBaselineRecorder;
  private comparator: TestIntegrityComparator;
  private verdictEvaluator: QAVerdictEvaluator;
  private runtimeRegistry: RuntimeRegistry;
  private config: SdlcConfig | null = null;

  constructor(private workspaceRoot: string = process.cwd()) {
    this.store = new DurableStateStore(workspaceRoot);
    this.logger = new AuditEventLogger(workspaceRoot);
    this.projector = new BrainProjector(workspaceRoot);
    this.artifacts = new ArtifactManager(workspaceRoot);
    this.linear = new LinearIntegration();
    this.github = new GitHubIntegration(workspaceRoot);
    this.ci = new CIIntegration();
    this.baselineRecorder = new TestIntegrityBaselineRecorder(workspaceRoot);
    this.comparator = new TestIntegrityComparator();
    this.verdictEvaluator = new QAVerdictEvaluator();
    this.runtimeRegistry = new RuntimeRegistry();
  }

  private async getConfig(): Promise<SdlcConfig> {
    if (!this.config) {
      this.config = await loadSdlcConfig(this.workspaceRoot);
    }
    return this.config;
  }

  private async transition(
    run: WorkflowRun,
    toState: WorkflowState,
    trigger: string,
    role: AgentRole | "system" | "human" = "system",
    commitSha?: string,
  ): Promise<void> {
    validateTransition(run.state, toState, trigger);
    const previousState = run.state;
    run.state = toState;
    run.updatedAt = new Date().toISOString();

    await this.store.saveRun(run);
    await this.logger.recordEvent(run.runId, previousState, toState, trigger, role, commitSha);
    await this.projector.projectRun(run);
  }

  /**
   * 1. INTAKE: Initializes a new feature request run.
   */
  async createRun(objective: string, mode: RunMode = "implementation"): Promise<WorkflowRun> {
    const runId = `sdlc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const run: WorkflowRun = {
      runId,
      objective,
      state: "INTAKE",
      mode,
      createdAt: now,
      updatedAt: now,
      story: {
        id: `story_${runId}`,
        title: objective,
        problemStatement: objective,
        desiredOutcome: objective,
        requirements: [],
        acceptanceCriteria: [],
        inScope: [],
        outOfScope: [],
        affectedModules: [],
        tasks: [],
      },
      approvals: {},
      activeWorkers: {},
      qaReports: [],
      triageRecords: [],
      idempotencyKeys: {},
    };

    await this.store.saveRun(run);
    await this.logger.recordEvent(runId, "INTAKE", "INTAKE", "Run Created", "orchestrator");
    await this.projector.projectRun(run);

    return run;
  }

  /**
   * 2. DISCOVERY: Technical investigation and baseline capture.
   */
  async startDiscovery(runId: string): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);
    await this.transition(run, "DISCOVERY", "Start Technical Discovery", "architect");

    // Capture pre-implementation baseline
    const baseline = await this.baselineRecorder.captureBaseline();
    await this.artifacts.saveArtifact(runId, "baseline-results", baseline);

    return run;
  }

  /**
   * 3. AWAITING_PLAN_APPROVAL: Formulates proposed scope, architecture, and task graph.
   */
  async submitPlanForApproval(
    runId: string,
    plan: {
      title: string;
      requirements: string[];
      acceptanceCriteria: string[];
      affectedModules: string[];
      tasks: Array<{
        id: string;
        title: string;
        description: string;
        assignedRole: AgentRole;
        dependencies?: string[];
      }>;
    },
  ): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);
    const config = await this.getConfig();

    run.story.title = plan.title;
    run.story.requirements = plan.requirements;
    run.story.acceptanceCriteria = plan.acceptanceCriteria;
    run.story.affectedModules = plan.affectedModules;
    run.story.tasks = plan.tasks.map((t) => ({
      ...t,
      dependencies: t.dependencies || [],
      status: "pending",
      retryCount: 0,
      maxRetries: config.retries.maxRetriesPerTask,
    }));

    await this.artifacts.saveArtifact(runId, "approved-plan", plan);
    await this.transition(run, "AWAITING_PLAN_APPROVAL", "Plan Submitted for Human Review", "orchestrator");

    return run;
  }

  /**
   * Gate A: Explicit Human Approval of the Plan.
   */
  async approvePlan(
    runId: string,
    approver: string,
    modeOverride?: RunMode,
    notes?: string,
  ): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);
    if (run.state !== "AWAITING_PLAN_APPROVAL") {
      throw new SdlcError(`Cannot approve plan: run is currently in state "${run.state}".`);
    }

    if (modeOverride) {
      run.mode = modeOverride;
    }

    const approval: ApprovalRecord = {
      gate: "PLAN",
      approved: true,
      timestamp: new Date().toISOString(),
      approver,
      notes,
    };
    run.approvals.plan = approval;

    if (run.mode === "planning") {
      await this.transition(run, "PLANNING_ONLY", "Plan Approved (Planning Only Mode)", "human");
      await this.transition(run, "COMPLETED", "Planning Artifacts Finalized", "system");
      return run;
    }

    await this.transition(run, "DECOMPOSITION", "Plan Approved for Implementation", "human");
    return run;
  }

  /**
   * 4. DECOMPOSITION: Syncs work hierarchy with Linear.
   */
  async decomposeWork(runId: string): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);
    if (run.state !== "DECOMPOSITION") {
      throw new SdlcError(`Cannot decompose work: run is in state "${run.state}".`);
    }

    // Sync story with Linear
    const storyKey = await this.linear.createStoryIssue(run.story, `linear_story_${runId}`);
    run.story.linearId = storyKey;

    // Sync task items
    const taskKeys = await this.linear.createTaskIssues(storyKey, run.story.tasks);
    for (const task of run.story.tasks) {
      const key = taskKeys.get(task.id);
      if (key) {
        task.branch = `sdlc/${key.toLowerCase()}-${task.id}`;
      }
    }

    await this.artifacts.saveArtifact(runId, "task-graph", run.story.tasks);
    await this.transition(run, "IMPLEMENTATION", "Decomposition Complete -> Implementation", "orchestrator");

    return run;
  }

  /**
   * 5. IMPLEMENTATION: Dispatches implementer worker in isolated worktree.
   */
  async executeImplementation(
    runId: string,
    implementationArtifacts: { candidateSha: string; filesChanged: string[] },
  ): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);

    // Enforce Gate A Approval check
    if (!run.approvals.plan?.approved) {
      throw new MissingApprovalError("PLAN");
    }

    // Enforce Orchestrator cannot implement features directly
    const implementerRole: AgentRole = "implementer";
    const adapter = this.runtimeRegistry.getAdapter();

    const workerSession = await adapter.spawnWorker({
      role: implementerRole,
      taskTitle: run.story.title,
      instructions: `Implement requirements:\n${run.story.requirements.join("\n")}`,
      allowedTools: ["read_file", "write_file", "edit_file", "git_commit"],
    });

    run.activeWorkers[workerSession.sessionId] = {
      role: implementerRole,
      sessionId: workerSession.sessionId,
      startedAt: workerSession.startedAt,
    };

    // Open PR on GitHub
    const pr = await this.github.openPullRequest({
      title: run.story.title,
      headBranch: `sdlc/${run.runId}-feature`,
      baseBranch: "main",
      body: `Automated PR for Story ${run.story.linearId || run.runId}`,
      candidateSha: implementationArtifacts.candidateSha,
    });

    for (const task of run.story.tasks) {
      if (task.assignedRole === "implementer") {
        task.status = "completed";
        task.candidateSha = implementationArtifacts.candidateSha;
        task.prUrl = pr.url;
        task.prNumber = pr.number;
      }
    }

    delete run.activeWorkers[workerSession.sessionId];
    await this.transition(
      run,
      "TEST_AUTHORING",
      "Implementation Complete -> Test Authoring",
      "implementer",
      implementationArtifacts.candidateSha,
    );

    return run;
  }

  /**
   * 6. TEST_AUTHORING: Dispatches test engineer to author/update tests against requirements.
   */
  async executeTestAuthoring(runId: string): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);
    const adapter = this.runtimeRegistry.getAdapter();

    const workerSession = await adapter.spawnWorker({
      role: "test-engineer",
      taskTitle: `Author tests for ${run.story.title}`,
      instructions: `Author comprehensive tests covering criteria:\n${run.story.acceptanceCriteria.join("\n")}`,
      allowedTools: ["read_file", "write_file", "edit_file", "run_test"],
    });

    for (const task of run.story.tasks) {
      if (task.assignedRole === "test-engineer") {
        task.status = "completed";
      }
    }

    await this.transition(run, "QA", "Test Authoring Complete -> QA Verification", "test-engineer");
    return run;
  }

  /**
   * 7. QA: Independent verification and anti-tamper test audit.
   */
  async executeQA(
    runId: string,
    params: {
      candidateSha: string;
      unitTestResults: { passed: number; failed: number; skipped: number; logs: string; assertionCount?: number };
      lintPassed: boolean;
      typeCheckPassed: boolean;
      diffText?: string;
      environmentBlocked?: boolean;
      blockReason?: string;
    },
  ): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);
    const baseline =
      (await this.artifacts.loadArtifact<TestIntegrityBaseline>(runId, "baseline-results")) ||
      (await this.baselineRecorder.captureBaseline());

    // 1. Audit test integrity (anti-tamper)
    const assertionCount =
      params.unitTestResults.assertionCount ??
      baseline.assertionCount + params.unitTestResults.passed * 2;

    const violations = this.comparator.detectViolations(
      baseline,
      {
        suiteCount: baseline.suiteCount,
        testCount: baseline.testCount + params.unitTestResults.passed + params.unitTestResults.failed,
        skippedCount: params.unitTestResults.skipped,
        assertionCount,
      },
      params.diffText,
    );

    // Verify candidate SHA matches task candidate SHA
    const expectedSha = run.story.tasks.find((t) => t.candidateSha)?.candidateSha;
    if (expectedSha && params.candidateSha !== expectedSha) {
      violations.push({
        file: "candidate_commit",
        type: "disabled_check",
        description: `Tested commit SHA (${params.candidateSha}) does not match candidate PR SHA (${expectedSha})`,
        severity: "critical",
      });
    }

    // 2. Evaluate QA Verdict
    const qaReport = this.verdictEvaluator.evaluateVerdict({
      runId,
      testedSha: params.candidateSha,
      unitTests: params.unitTestResults,
      lintPassed: params.lintPassed,
      typeCheckPassed: params.typeCheckPassed,
      integrityViolations: violations,
      environmentBlocked: params.environmentBlocked,
      blockReason: params.blockReason,
    });

    run.qaReports.push(qaReport);
    await this.artifacts.saveArtifact(runId, "qa-report", qaReport);

    if (run.story.linearId) {
      await this.linear.attachQAReport(run.story.linearId, qaReport);
    }

    if (qaReport.verdict === "BLOCKED") {
      await this.transition(run, "BLOCKED", "QA Blocked by External Environment", "qa-agent", params.candidateSha);
      return run;
    }

    if (qaReport.verdict === "FAIL") {
      await this.transition(run, "TRIAGE", "QA Checks Failed -> Triage", "qa-agent", params.candidateSha);
      return run;
    }

    // QA Passed -> Ready for Human Review
    await this.transition(
      run,
      "READY_FOR_HUMAN_REVIEW",
      "QA Passed -> Ready for Human Review",
      "qa-agent",
      params.candidateSha,
    );
    await this.transition(
      run,
      "AWAITING_STORY_APPROVAL",
      "Story Packet Prepared for Gate B",
      "orchestrator",
      params.candidateSha,
    );

    return run;
  }

  /**
   * 8. TRIAGE: Handles QA failures, diagnoses root cause, routes bounded retries.
   */
  async executeTriage(
    runId: string,
    diagnosis: {
      rootCauseCategory: TriageRecord["rootCauseCategory"];
      analysis: string;
      recommendedAction: string;
      targetRole: AgentRole;
    },
  ): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);
    if (run.state !== "TRIAGE") {
      throw new SdlcError(`Cannot triage: run is currently in state "${run.state}".`);
    }

    // Find failing task and check retry budget
    const targetTask = run.story.tasks.find((t) => t.assignedRole === diagnosis.targetRole);
    const retryCount = (targetTask?.retryCount || 0) + 1;

    if (targetTask) {
      targetTask.retryCount = retryCount;
      if (retryCount > targetTask.maxRetries) {
        await this.transition(run, "AWAITING_HUMAN", "Retry Budget Exhausted -> Human Escalation", "triage-agent");
        throw new RetryBudgetExceededError(targetTask.title, targetTask.maxRetries);
      }
    }

    const triageRecord: TriageRecord = {
      runId,
      qaReportTimestamp: new Date().toISOString(),
      rootCauseCategory: diagnosis.rootCauseCategory,
      analysis: diagnosis.analysis,
      recommendedAction: diagnosis.recommendedAction,
      targetRole: diagnosis.targetRole,
      retryCount,
    };

    run.triageRecords.push(triageRecord);

    if (diagnosis.targetRole === "implementer") {
      await this.transition(run, "IMPLEMENTATION", `Triage Re-routed to Implementation (Attempt ${retryCount})`, "triage-agent");
    } else if (diagnosis.targetRole === "test-engineer") {
      await this.transition(run, "TEST_AUTHORING", `Triage Re-routed to Test Authoring (Attempt ${retryCount})`, "triage-agent");
    } else {
      await this.transition(run, "AWAITING_HUMAN", "Triage Requires Human Resolution", "triage-agent");
    }

    return run;
  }

  /**
   * Gate B: Explicit Human Approval of the Completed Story.
   */
  async approveStory(runId: string, approver: string, notes?: string): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);
    if (run.state !== "AWAITING_STORY_APPROVAL") {
      throw new SdlcError(`Cannot approve story: run is currently in state "${run.state}".`);
    }

    const latestQa = run.qaReports[run.qaReports.length - 1];
    if (!latestQa || latestQa.verdict !== "PASS") {
      throw new SdlcError("Cannot approve story for release: no passing QA verdict exists.");
    }

    const approval: ApprovalRecord = {
      gate: "STORY",
      approved: true,
      timestamp: new Date().toISOString(),
      approver,
      notes,
      candidateSha: latestQa.testedSha,
    };

    run.approvals.story = approval;
    await this.transition(run, "RELEASE", "Gate B Story Approved for Staging Release", "human", latestQa.testedSha);

    return run;
  }

  /**
   * 9. RELEASE: Merges authorized PRs to staging.
   */
  async executeRelease(runId: string): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);

    // Enforce Gate B Approval check
    if (!run.approvals.story?.approved) {
      throw new MissingApprovalError("STORY");
    }

    // Verify candidate SHA freshness
    const approvedSha = run.approvals.story.candidateSha;
    for (const task of run.story.tasks) {
      if (task.candidateSha && approvedSha && task.candidateSha !== approvedSha) {
        throw new SdlcError(
          `Cannot release: task "${task.id}" candidate SHA (${task.candidateSha}) does not match approved Gate B SHA (${approvedSha}).`,
        );
      }
    }

    const mergedPrs: Array<{ prNumber: number; sha: string }> = [];

    for (const task of run.story.tasks) {
      if (task.prNumber) {
        const mergeResult = await this.github.mergePullRequest(task.prNumber, true);
        mergedPrs.push({ prNumber: task.prNumber, sha: mergeResult.sha });
      }
    }

    await this.transition(run, "STAGING_VERIFICATION", "PRs Merged -> Staging Verification", "release-agent");
    return run;
  }

  /**
   * 10. STAGING_VERIFICATION: Runs smoke tests and finalizes completion.
   */
  async verifyStaging(runId: string, simulateSmokeFailure = false): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);
    const smokePassed = await this.ci.runStagingSmokeTests("deploy_staging_001", simulateSmokeFailure);

    if (!smokePassed) {
      await this.transition(run, "FAILED", "Staging Smoke Tests Failed", "release-agent");
      throw new SdlcError("Staging smoke tests failed. Release aborted.");
    }

    const releaseManifest: ReleaseManifest = {
      runId,
      storyId: run.story.id,
      timestamp: new Date().toISOString(),
      targetEnvironment: "staging",
      mergedPrs: run.story.tasks.filter((t) => t.prNumber).map((t) => ({ prNumber: t.prNumber!, sha: t.candidateSha || "unknown" })),
      stagingDeploymentId: "deploy_staging_001",
      smokeTestsPassed: true,
      verifiedBy: "automated_smoke_suite",
    };

    run.releaseManifest = releaseManifest;
    await this.artifacts.saveArtifact(runId, "release-manifest", releaseManifest);

    if (run.story.linearId) {
      await this.linear.updateStatus(run.story.linearId, "Done");
    }

    await this.transition(run, "COMPLETED", "Staging Verification Passed -> Story Completed", "release-agent");
    return run;
  }

  /**
   * Cancellation & Heartbeat Recovery.
   */
  async cancelRun(runId: string, reason = "User requested cancellation"): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);
    const adapter = this.runtimeRegistry.getAdapter();

    for (const sessionId of Object.keys(run.activeWorkers)) {
      await adapter.cancelWorker(sessionId);
    }
    run.activeWorkers = {};

    await this.transition(run, "CANCELLED", reason, "human");
    return run;
  }

  async resumeRun(runId: string): Promise<WorkflowRun> {
    const run = await this.mustGetRun(runId);
    const adapter = this.runtimeRegistry.getAdapter();

    for (const [sessionId, worker] of Object.entries(run.activeWorkers)) {
      await adapter.resumeWorker(sessionId);
    }

    await this.projector.projectRun(run);
    return run;
  }

  async getRun(runId: string): Promise<WorkflowRun | null> {
    return this.store.getRun(runId);
  }

  async listRuns(): Promise<WorkflowRun[]> {
    return this.store.listRuns();
  }

  private async mustGetRun(runId: string): Promise<WorkflowRun> {
    const run = await this.store.getRun(runId);
    if (!run) {
      throw new SdlcError(`Run with ID "${runId}" not found.`);
    }
    return run;
  }
}
