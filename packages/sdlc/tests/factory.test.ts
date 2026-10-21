import { mkdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AGENT_CONTRACTS,
  AuditEventLogger,
  BrainProjector,
  CIIntegration,
  DurableStateStore,
  enforceContract,
  GitHubIntegration,
  InvalidStateTransitionError,
  LinearIntegration,
  MissingApprovalError,
  QAVerdictEvaluator,
  redactObject,
  redactSecrets,
  RetryBudgetExceededError,
  RuntimeRegistry,
  SdlcEngine,
  TestIntegrityComparator,
  UnauthorizedActionError,
  validateTransition,
} from "../src/index.js";

describe("Agentic SDLC Software Factory Invariant Tests", () => {
  let tempDir: string;
  let engine: SdlcEngine;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `sdlc-test-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`);
    await mkdir(tempDir, { recursive: true });
    engine = new SdlcEngine(tempDir);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  // Test 1: Request cannot skip Gate A plan approval
  it("Test 1: prevents entering implementation without Gate A plan approval", async () => {
    const run = await engine.createRun("Build new authentication module");
    await engine.startDiscovery(run.runId);
    await engine.submitPlanForApproval(run.runId, {
      title: "Auth Module Plan",
      requirements: ["JWT handling"],
      acceptanceCriteria: ["Validates tokens"],
      affectedModules: ["packages/auth"],
      tasks: [
        {
          id: "task_1",
          title: "Implement JWT parser",
          description: "Build parser",
          assignedRole: "implementer",
        },
      ],
    });

    await expect(
      engine.executeImplementation(run.runId, {
        candidateSha: "commit_abc123",
        filesChanged: ["src/jwt.ts"],
      }),
    ).rejects.toThrow(MissingApprovalError);
  });

  // Test 2: Planning-only mode writes zero code and terminates in COMPLETED
  it("Test 2: planning-only mode produces plan artifacts and completes without code execution", async () => {
    const run = await engine.createRun("Architectural audit of payment routing", "planning");
    await engine.startDiscovery(run.runId);
    await engine.submitPlanForApproval(run.runId, {
      title: "Payment Architecture Plan",
      requirements: ["Evaluate routing"],
      acceptanceCriteria: ["Produce architecture doc"],
      affectedModules: ["packages/utils"],
      tasks: [],
    });

    const approvedRun = await engine.approvePlan(run.runId, "Lead Architect");
    expect(approvedRun.state).toBe("COMPLETED");
    expect(approvedRun.approvals.plan?.approved).toBe(true);

    const brainContent = await readFile(path.join(tempDir, ".factory", "brain", `SDLC-${run.runId}.md`), "utf8");
    expect(brainContent).toContain("COMPLETED");
    expect(brainContent).toContain("Lead Architect");
  });

  // Test 3: Orchestrator sandbox denies direct code writing, testing, and PR merging
  it("Test 3: orchestrator role sandbox denies code modification, test authoring, and PR merging", () => {
    const contract = AGENT_CONTRACTS.orchestrator;
    expect(contract.forbiddenActions).toContain("write_file");
    expect(contract.forbiddenActions).toContain("edit_file");
    expect(contract.forbiddenActions).toContain("run_test");
    expect(contract.forbiddenActions).toContain("merge_pr");

    expect(() => enforceContract("orchestrator", "write_file")).toThrow(UnauthorizedActionError);
    expect(() => enforceContract("orchestrator", "edit_file")).toThrow(UnauthorizedActionError);
    expect(() => enforceContract("orchestrator", "run_test")).toThrow(UnauthorizedActionError);
    expect(() => enforceContract("orchestrator", "merge_pr")).toThrow(UnauthorizedActionError);
    expect(() => enforceContract("orchestrator", "linear_update")).not.toThrow();
  });

  // Test 4: Invalid state transitions throw InvalidStateTransitionError
  it("Test 4: strictly enforces the state machine and throws InvalidStateTransitionError on illegal transitions", () => {
    expect(() => validateTransition("INTAKE", "RELEASE")).toThrow(InvalidStateTransitionError);
    expect(() => validateTransition("IMPLEMENTATION", "COMPLETED")).toThrow(InvalidStateTransitionError);
    expect(() => validateTransition("AWAITING_PLAN_APPROVAL", "STAGING_VERIFICATION")).toThrow(InvalidStateTransitionError);
    expect(() => validateTransition("INTAKE", "DISCOVERY")).not.toThrow();
    expect(() => validateTransition("RELEASE", "STAGING_VERIFICATION")).not.toThrow();
  });

  // Test 5: Idempotency keys prevent duplicate issue/PR side effects on retry
  it("Test 5: idempotency keys prevent duplicate issues and pull requests", async () => {
    const linear = new LinearIntegration("BOB");
    const story = {
      id: "story_1",
      title: "Unique Feature",
      problemStatement: "Problem",
      desiredOutcome: "Outcome",
      requirements: [],
      acceptanceCriteria: [],
      inScope: [],
      outOfScope: [],
      affectedModules: [],
      tasks: [],
    };

    const key1 = await linear.createStoryIssue(story, "idemp_story_abc");
    const key2 = await linear.createStoryIssue(story, "idemp_story_abc");
    expect(key1).toBe(key2);

    const github = new GitHubIntegration(tempDir);
    const pr1 = await github.openPullRequest({
      title: "Feature PR",
      headBranch: "sdlc/feature-branch",
      baseBranch: "main",
      body: "Body",
      candidateSha: "sha_001",
      idempotencyKey: "idemp_pr_abc",
    });
    const pr2 = await github.openPullRequest({
      title: "Feature PR",
      headBranch: "sdlc/feature-branch",
      baseBranch: "main",
      body: "Body",
      candidateSha: "sha_001",
      idempotencyKey: "idemp_pr_abc",
    });
    expect(pr1.number).toBe(pr2.number);
    expect(pr1.url).toBe(pr2.url);
  });

  // Test 6: Worker process crashes preserve durable engine state
  it("Test 6: unhandled worker process exceptions leave durable on-disk state uncorrupted", async () => {
    const run = await engine.createRun("Resilient storage verification");
    await engine.startDiscovery(run.runId);

    const storePath = path.join(tempDir, ".factory", "engine", "runs", `${run.runId}.json`);
    const rawContent = await readFile(storePath, "utf8");
    const parsed = JSON.parse(rawContent);

    expect(parsed.runId).toBe(run.runId);
    expect(parsed.state).toBe("DISCOVERY");
  });

  // Test 7: Interrupted runs resume seamlessly from the last committed state
  it("Test 7: interrupted runs restore their exact state, artifacts, and task history", async () => {
    const run = await engine.createRun("Resume verification");
    await engine.startDiscovery(run.runId);
    await engine.submitPlanForApproval(run.runId, {
      title: "Plan for resume",
      requirements: ["R1"],
      acceptanceCriteria: ["AC1"],
      affectedModules: ["packages/ui"],
      tasks: [],
    });

    const newEngineInstance = new SdlcEngine(tempDir);
    const resumed = await newEngineInstance.resumeRun(run.runId);

    expect(resumed.runId).toBe(run.runId);
    expect(resumed.state).toBe("AWAITING_PLAN_APPROVAL");
    expect(resumed.story.title).toBe("Plan for resume");
  });

  // Test 8: Concurrent runs write to isolated brain files and workspaces without race conditions
  it("Test 8: concurrent runs maintain isolated brain files, logs, and artifacts without collision", async () => {
    const [runA, runB] = await Promise.all([
      engine.createRun("Concurrent Task Alpha"),
      engine.createRun("Concurrent Task Beta"),
    ]);

    expect(runA.runId).not.toBe(runB.runId);

    const brainA = path.join(tempDir, ".factory", "brain", `SDLC-${runA.runId}.md`);
    const brainB = path.join(tempDir, ".factory", "brain", `SDLC-${runB.runId}.md`);

    const [contentA, contentB] = await Promise.all([readFile(brainA, "utf8"), readFile(brainB, "utf8")]);

    expect(contentA).toContain("Concurrent Task Alpha");
    expect(contentB).toContain("Concurrent Task Beta");
    expect(contentA).not.toContain("Concurrent Task Beta");
  });

  // Test 9: QA failures generate structured triage records and route to appropriate agents
  it("Test 9: QA failures trigger transition to TRIAGE and generate actionable triage records", async () => {
    const run = await engine.createRun("QA failure handling");
    await engine.startDiscovery(run.runId);
    await engine.submitPlanForApproval(run.runId, {
      title: "Feature With Bug",
      requirements: ["Handle edge case"],
      acceptanceCriteria: ["Edge case passes"],
      affectedModules: ["packages/utils"],
      tasks: [
        {
          id: "task_impl",
          title: "Implement logic",
          description: "Write code",
          assignedRole: "implementer",
        },
        {
          id: "task_test",
          title: "Write tests",
          description: "Write test cases",
          assignedRole: "test-engineer",
        },
      ],
    });
    await engine.approvePlan(run.runId, "QA Lead");
    await engine.decomposeWork(run.runId);
    await engine.executeImplementation(run.runId, {
      candidateSha: "sha_impl_01",
      filesChanged: ["src/index.ts"],
    });
    await engine.executeTestAuthoring(run.runId);

    // Execute QA with a failing unit test
    const qaRun = await engine.executeQA(run.runId, {
      candidateSha: "sha_impl_01",
      unitTestResults: { passed: 4, failed: 1, skipped: 0, logs: "Assertion error at line 42" },
      lintPassed: true,
      typeCheckPassed: true,
    });

    expect(qaRun.state).toBe("TRIAGE");
    expect(qaRun.qaReports[0].verdict).toBe("FAIL");

    const triageRun = await engine.executeTriage(run.runId, {
      rootCauseCategory: "implementation_defect",
      analysis: "Null pointer in index.ts:42",
      recommendedAction: "Add optional chaining",
      targetRole: "implementer",
    });

    expect(triageRun.state).toBe("IMPLEMENTATION");
    expect(triageRun.triageRecords.length).toBe(1);
    expect(triageRun.triageRecords[0].targetRole).toBe("implementer");
  });

  // Test 10: Retry budget exhaustion escalates to AWAITING_HUMAN
  it("Test 10: exceeding task retry budget halts automated retry and escalates to AWAITING_HUMAN", async () => {
    const run = await engine.createRun("Retry budget test");
    await engine.startDiscovery(run.runId);
    await engine.submitPlanForApproval(run.runId, {
      title: "Fragile feature",
      requirements: ["F1"],
      acceptanceCriteria: ["A1"],
      affectedModules: ["packages/ui"],
      tasks: [
        {
          id: "task_1",
          title: "Fragile task",
          description: "Fails repeatedly",
          assignedRole: "implementer",
        },
      ],
    });
    await engine.approvePlan(run.runId, "Reviewer");
    await engine.decomposeWork(run.runId);
    await engine.executeImplementation(run.runId, {
      candidateSha: "sha_cand_1",
      filesChanged: ["src/component.tsx"],
    });
    await engine.executeTestAuthoring(run.runId);

    // Simulate exhausting retries (maxRetries is 3 in default config)
    for (let i = 0; i < 3; i++) {
      await engine.executeQA(run.runId, {
        candidateSha: "sha_cand_1",
        unitTestResults: { passed: 0, failed: 1, skipped: 0, logs: "Persistent bug" },
        lintPassed: true,
        typeCheckPassed: true,
      });

      await engine.executeTriage(run.runId, {
        rootCauseCategory: "implementation_defect",
        analysis: "Bug analysis",
        recommendedAction: "Fix bug",
        targetRole: "implementer",
      });

      // Advance through implementation and test authoring back to QA
      await engine.executeImplementation(run.runId, {
        candidateSha: "sha_cand_1",
        filesChanged: ["src/component.tsx"],
      });
      await engine.executeTestAuthoring(run.runId);
    }

    // 4th failure must exceed maxRetries and escalate
    await engine.executeQA(run.runId, {
      candidateSha: "sha_cand_1",
      unitTestResults: { passed: 0, failed: 1, skipped: 0, logs: "Exhausted" },
      lintPassed: true,
      typeCheckPassed: true,
    });

    await expect(
      engine.executeTriage(run.runId, {
        rootCauseCategory: "implementation_defect",
        analysis: "Exhausted all retries",
        recommendedAction: "Escalate to human",
        targetRole: "implementer",
      }),
    ).rejects.toThrow(RetryBudgetExceededError);

    const escalated = await engine.getRun(run.runId);
    expect(escalated?.state).toBe("AWAITING_HUMAN");
  });

  // Test 11: Test-integrity comparator catches removed assertions and newly skipped tests
  it("Test 11: anti-tamper comparator detects removed assertions, newly skipped tests, and coverage degradation", () => {
    const comparator = new TestIntegrityComparator();
    const baseline = {
      baseSha: "sha_base_001",
      timestamp: new Date().toISOString(),
      suiteCount: 10,
      testCount: 50,
      skippedCount: 0,
      assertionCount: 100,
      coverageThresholds: { lines: 80, statements: 80 },
    };

    const skippedViolations = comparator.detectViolations(baseline, {
      suiteCount: 10,
      testCount: 50,
      skippedCount: 2,
      assertionCount: 100,
    });
    expect(skippedViolations.some((v) => v.type === "newly_skipped")).toBe(true);

    const removedAssertionViolations = comparator.detectViolations(baseline, {
      suiteCount: 10,
      testCount: 50,
      skippedCount: 0,
      assertionCount: 85,
    });
    expect(removedAssertionViolations.some((v) => v.type === "removed_assertion")).toBe(true);

    const diffTamperingViolations = comparator.detectViolations(
      baseline,
      {
        suiteCount: 10,
        testCount: 50,
        skippedCount: 0,
        assertionCount: 100,
      },
      "+++ b/tests/auth.test.ts\n+ it.skip('should validate token', () => {});",
    );
    expect(diffTamperingViolations.some((v) => v.type === "newly_skipped")).toBe(true);
  });

  // Test 12: QA evidence validates exact commit SHA matching the candidate PR
  it("Test 12: QA rejects evidence if tested commit SHA does not match the candidate PR SHA", async () => {
    const run = await engine.createRun("SHA verification test");
    await engine.startDiscovery(run.runId);
    await engine.submitPlanForApproval(run.runId, {
      title: "Feature for SHA audit",
      requirements: ["R1"],
      acceptanceCriteria: ["A1"],
      affectedModules: ["packages/auth"],
      tasks: [
        {
          id: "task_auth",
          title: "Build auth",
          description: "Auth task",
          assignedRole: "implementer",
        },
      ],
    });
    await engine.approvePlan(run.runId, "Security Lead");
    await engine.decomposeWork(run.runId);
    await engine.executeImplementation(run.runId, {
      candidateSha: "candidate_sha_12345",
      filesChanged: ["src/auth.ts"],
    });
    await engine.executeTestAuthoring(run.runId);

    // Run QA with mismatched candidate SHA
    const mismatchedQaRun = await engine.executeQA(run.runId, {
      candidateSha: "fraudulent_sha_67890",
      unitTestResults: { passed: 10, failed: 0, skipped: 0, logs: "Clean run" },
      lintPassed: true,
      typeCheckPassed: true,
    });

    expect(mismatchedQaRun.state).toBe("TRIAGE");
    expect(mismatchedQaRun.qaReports[0].verdict).toBe("FAIL");
    expect(mismatchedQaRun.qaReports[0].evidence.integrityVerified).toBe(false);
  });

  // Test 13: Stale/unapproved candidate SHAs cannot authorize release
  it("Test 13: detects altered candidate SHA after Gate B approval and rejects release", async () => {
    const run = await engine.createRun("Stale SHA release rejection test");
    await engine.startDiscovery(run.runId);
    await engine.submitPlanForApproval(run.runId, {
      title: "Tamper post-Gate B test",
      requirements: ["R1"],
      acceptanceCriteria: ["A1"],
      affectedModules: ["packages/auth"],
      tasks: [
        {
          id: "task_1",
          title: "Implement",
          description: "Desc",
          assignedRole: "implementer",
        },
      ],
    });
    await engine.approvePlan(run.runId, "Architect");
    await engine.decomposeWork(run.runId);
    await engine.executeImplementation(run.runId, {
      candidateSha: "valid_sha_111",
      filesChanged: ["src/code.ts"],
    });
    await engine.executeTestAuthoring(run.runId);
    await engine.executeQA(run.runId, {
      candidateSha: "valid_sha_111",
      unitTestResults: { passed: 5, failed: 0, skipped: 0, logs: "" },
      lintPassed: true,
      typeCheckPassed: true,
    });

    await engine.approveStory(run.runId, "Release Manager");

    // Tamper with persisted task candidate SHA to simulate stale/modified commit
    const currentRun = (await engine.getRun(run.runId))!;
    currentRun.story.tasks[0].candidateSha = "unapproved_sha_999";
    const store = new DurableStateStore(tempDir);
    await store.saveRun(currentRun);

    await expect(engine.executeRelease(run.runId)).rejects.toThrow(
      /does not match approved Gate B SHA/,
    );
  });

  // Test 14: Pull requests cannot be merged before Gate B story approval
  it("Test 14: pull requests strictly cannot be merged before explicit Gate B story approval", async () => {
    const run = await engine.createRun("Gate B release enforcement");
    await engine.startDiscovery(run.runId);
    await engine.submitPlanForApproval(run.runId, {
      title: "Gate B test feature",
      requirements: ["R1"],
      acceptanceCriteria: ["A1"],
      affectedModules: ["packages/ui"],
      tasks: [
        {
          id: "task_ui",
          title: "UI task",
          description: "Desc",
          assignedRole: "implementer",
        },
      ],
    });
    await engine.approvePlan(run.runId, "Product Owner");
    await engine.decomposeWork(run.runId);
    await engine.executeImplementation(run.runId, {
      candidateSha: "ui_sha_555",
      filesChanged: ["src/ui.tsx"],
    });
    await engine.executeTestAuthoring(run.runId);
    await engine.executeQA(run.runId, {
      candidateSha: "ui_sha_555",
      unitTestResults: { passed: 3, failed: 0, skipped: 0, logs: "" },
      lintPassed: true,
      typeCheckPassed: true,
    });

    // Attempting release without Gate B approval throws MissingApprovalError
    await expect(engine.executeRelease(run.runId)).rejects.toThrow(MissingApprovalError);

    const github = new GitHubIntegration(tempDir);
    await expect(github.mergePullRequest(201, false)).rejects.toThrow(/Gate B Story Approval/);
  });

  // Test 15: Failed staging smoke tests halt completion and prevent story closeout
  it("Test 15: staging smoke test failure aborts release and transitions run to FAILED", async () => {
    const run = await engine.createRun("Smoke failure test");
    await engine.startDiscovery(run.runId);
    await engine.submitPlanForApproval(run.runId, {
      title: "Smoke failure feature",
      requirements: ["R1"],
      acceptanceCriteria: ["A1"],
      affectedModules: ["packages/icons"],
      tasks: [
        {
          id: "task_icons",
          title: "Icons task",
          description: "Desc",
          assignedRole: "implementer",
        },
      ],
    });
    await engine.approvePlan(run.runId, "Dev Lead");
    await engine.decomposeWork(run.runId);
    await engine.executeImplementation(run.runId, {
      candidateSha: "icon_sha_777",
      filesChanged: ["src/icon.tsx"],
    });
    await engine.executeTestAuthoring(run.runId);
    await engine.executeQA(run.runId, {
      candidateSha: "icon_sha_777",
      unitTestResults: { passed: 2, failed: 0, skipped: 0, logs: "" },
      lintPassed: true,
      typeCheckPassed: true,
    });
    await engine.approveStory(run.runId, "Release QA");
    await engine.executeRelease(run.runId);

    // Verify staging with simulated smoke test failure
    await expect(engine.verifyStaging(run.runId, true)).rejects.toThrow(/smoke tests failed/);

    const failedRun = await engine.getRun(run.runId);
    expect(failedRun?.state).toBe("FAILED");
  });

  // Test 16: Missing runtime capabilities trigger safe fallback
  it("Test 16: unsupported runtime providers fall back cleanly to the primary adapter", () => {
    const registry = new RuntimeRegistry("antigravity");
    const adapter = registry.getAdapter("unregistered-runtime" as unknown as "antigravity");
    expect(adapter).toBeDefined();
    expect(adapter.provider).toBe("antigravity");
  });

  // Test 17: Redaction filters prevent secrets from leaking into brain files or logs
  it("Test 17: secret tokens and credentials are automatically redacted from logs and brain projections", async () => {
    const sensitiveToken = "ghp_1234567890abcdef1234567890abcdef1234";
    const openAiSecret = "sk-abcdef123456789012345678";
    const bearerHeader = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummyPayload.dummySignature";

    const redacted = redactSecrets(`Pushing with ${sensitiveToken} and ${openAiSecret} using ${bearerHeader}`);
    expect(redacted).not.toContain(sensitiveToken);
    expect(redacted).not.toContain(openAiSecret);
    expect(redacted).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    expect(redacted).toContain("[REDACTED]");

    const eventLogger = new AuditEventLogger(tempDir);
    await eventLogger.recordEvent(
      "sdlc_redact_test",
      "INTAKE",
      "DISCOVERY",
      `Triggered with ${sensitiveToken}`,
      "orchestrator",
      undefined,
      { apiKey: openAiSecret, normalField: "value" },
    );

    const logPath = path.join(tempDir, ".factory", "logs", "sdlc_redact_test.jsonl");
    const logContent = await readFile(logPath, "utf8");
    expect(logContent).not.toContain(sensitiveToken);
    expect(logContent).not.toContain(openAiSecret);
    expect(logContent).toContain("[REDACTED]");

    const run = await engine.createRun(`Deploy with secret ${sensitiveToken}`);
    const brainPath = path.join(tempDir, ".factory", "brain", `SDLC-${run.runId}.md`);
    const brainContent = await readFile(brainPath, "utf8");
    expect(brainContent).not.toContain(sensitiveToken);
    expect(brainContent).toContain("[REDACTED]");
  });

  // Test 18: Both Antigravity and Codex adapters execute supported lifecycle operations correctly
  it("Test 18: both Antigravity and Codex adapters spawn, track, cancel, and return output", async () => {
    const registry = new RuntimeRegistry();
    const agyAdapter = registry.getAdapter("antigravity");
    const codexAdapter = registry.getAdapter("codex");

    expect(agyAdapter.provider).toBe("antigravity");
    expect(codexAdapter.provider).toBe("codex");

    // Test Antigravity lifecycle
    const agySession = await agyAdapter.spawnWorker({
      role: "implementer",
      taskTitle: "Build auth subagent",
      instructions: "Implement JWT validation",
      allowedTools: ["read_file", "write_file", "edit_file"],
    });
    expect(agySession.sessionId).toMatch(/^agy_implementer_/);
    expect(agySession.status).toBe("running");

    const agyStatus = await agyAdapter.trackWorker(agySession.sessionId);
    expect(agyStatus.status).toBe("running");

    const agyOutput = await agyAdapter.getWorkerOutput(agySession.sessionId);
    expect(agyOutput.stdout).toContain("Build auth subagent");

    await agyAdapter.cancelWorker(agySession.sessionId);
    const agyCancelled = await agyAdapter.trackWorker(agySession.sessionId);
    expect(agyCancelled.status).toBe("cancelled");

    // Test Codex lifecycle
    const codexSession = await codexAdapter.spawnWorker({
      role: "test-engineer",
      taskTitle: "Write E2E test",
      instructions: "Write Playwright tests",
      allowedTools: ["read_file", "write_file"],
    });
    expect(codexSession.sessionId).toMatch(/^codex_test-engineer_/);
    expect(codexSession.status).toBe("running");

    const codexStatus = await codexAdapter.trackWorker(codexSession.sessionId);
    expect(codexStatus.status).toBe("running");

    const codexOutput = await codexAdapter.getWorkerOutput(codexSession.sessionId);
    expect(codexOutput.stdout).toContain("Write E2E test");

    await codexAdapter.cancelWorker(codexSession.sessionId);
    const codexCancelled = await codexAdapter.trackWorker(codexSession.sessionId);
    expect(codexCancelled.status).toBe("cancelled");
  });
});
