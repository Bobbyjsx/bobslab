import { SdlcEngine } from "./core/engine.js";

async function runDemo() {
  console.log("=== Starting Agentic SDLC Software Factory E2E Demonstration ===\n");
  const engine = new SdlcEngine();

  // 1. Intake
  console.log("1. INTAKE: Registering feature request...");
  const run = await engine.createRun(
    "Add resilient health-check endpoint to @bobslab/auth",
    "implementation",
  );
  console.log(`   Run ID: ${run.runId} | State: ${run.state}\n`);

  // 2. Discovery
  console.log("2. DISCOVERY: Technical investigation and baseline capture...");
  await engine.startDiscovery(run.runId);
  console.log(`   Captured baseline test metrics & AST snapshot.\n`);

  // 3. Plan Formulation
  console.log("3. PLANNING: Formulating architectural plan & task breakdown...");
  await engine.submitPlanForApproval(run.runId, {
    title: "Auth Health Check & Diagnostic Endpoint",
    requirements: [
      "Expose /health endpoint with uptime and token manager status",
      "Return JSON payload with status, timestamp, and active key status",
      "Do not leak secret keys or sensitive environment variables",
    ],
    acceptanceCriteria: [
      "GET /health returns HTTP 200 when token service is healthy",
      "Response payload strictly validates against HealthResponseSchema",
      "Returns HTTP 503 if token manager state is degraded",
    ],
    affectedModules: ["packages/auth", "packages/utils"],
    tasks: [
      {
        id: "task_auth_health",
        title: "Implement /health endpoint in @bobslab/auth",
        description: "Add health check handler with memory and token manager diagnostic check",
        assignedRole: "implementer",
      },
      {
        id: "task_auth_tests",
        title: "Author unit and integration tests for /health",
        description: "Cover 200 and 503 scenarios without weakening assertions",
        assignedRole: "test-engineer",
        dependencies: ["task_auth_health"],
      },
    ],
  });
  console.log(`   Plan formulated. State: AWAITING_PLAN_APPROVAL\n`);

  // 4. Gate A Human Approval
  console.log("4. GATE A (HUMAN APPROVAL): Approving implementation plan...");
  await engine.approvePlan(run.runId, "Lead Architect", undefined, "Plan verified against security guidelines.");
  console.log(`   Gate A Approved. State: DECOMPOSITION\n`);

  // 5. Decomposition & Linear Sync
  console.log("5. DECOMPOSITION: Syncing story & sub-tasks with Linear...");
  await engine.decomposeWork(run.runId);
  const updatedRun = (await engine.getRun(run.runId))!;
  console.log(`   Linear Story ID: ${updatedRun.story.linearId}`);
  for (const task of updatedRun.story.tasks) {
    console.log(`   - Task [${task.id}]: Assigned to ${task.assignedRole} (Branch: ${task.branch})`);
  }
  console.log();

  // 6. Implementation Worker Dispatch
  console.log("6. IMPLEMENTATION: Dispatching implementer worker in isolated worktree...");
  const candidateSha = "f4b2a91c3d8e";
  await engine.executeImplementation(run.runId, {
    candidateSha,
    filesChanged: ["packages/auth/src/health.ts"],
  });
  console.log(`   PR opened for candidate commit: ${candidateSha}\n`);

  // 7. Test Authoring
  console.log("7. TEST AUTHORING: Dispatching test-engineer to author verification tests...");
  await engine.executeTestAuthoring(run.runId);
  console.log(`   Tests authored covering all acceptance criteria. State: QA\n`);

  // 8. Independent QA Verification
  console.log("8. INDEPENDENT QA: Verifying candidate commit against anti-tamper test baseline...");
  const qaRun = await engine.executeQA(run.runId, {
    candidateSha,
    unitTestResults: {
      passed: 6,
      failed: 0,
      skipped: 0,
      logs: "All 6 health check test assertions passed cleanly.",
    },
    lintPassed: true,
    typeCheckPassed: true,
  });
  const latestQa = qaRun.qaReports[0]!;
  console.log(`   QA Verdict: ${latestQa.verdict}`);
  console.log(`   Integrity Verified: ${latestQa.evidence.integrityVerified}`);
  console.log(`   State: ${qaRun.state}\n`);

  // 9. Gate B Human Story Approval
  console.log("9. GATE B (HUMAN APPROVAL): Reviewing QA evidence & approving story for release...");
  await engine.approveStory(run.runId, "Release QA Lead", "All acceptance criteria verified with machine evidence.");
  console.log(`   Gate B Approved. State: RELEASE\n`);

  // 10. Staging Release
  console.log("10. RELEASE: Merging authorized PRs into staging...");
  await engine.executeRelease(run.runId);
  console.log(`    PRs merged to staging branch. State: STAGING_VERIFICATION\n`);

  // 11. Staging Verification & Closeout
  console.log("11. STAGING VERIFICATION: Executing automated staging smoke tests...");
  const finalRun = await engine.verifyStaging(run.runId);
  console.log(`    Staging smoke tests PASSED! Deployment ID: ${finalRun.releaseManifest?.stagingDeploymentId}`);
  console.log(`    Final State: ${finalRun.state}`);
  console.log(`    Brain projected to: .factory/brain/SDLC-${run.runId}.md\n`);

  console.log("=== End-to-End SDLC Software Factory Demonstration Successfully Completed! ===");
}

runDemo().catch((err) => {
  console.error("Demonstration failed:", err);
  process.exit(1);
});
