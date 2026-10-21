import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { redactSecrets } from "../utils/redact.js";
import type { WorkflowRun } from "../core/types.js";

export class BrainProjector {
  private brainDir: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.brainDir = path.join(workspaceRoot, ".factory", "brain");
  }

  async init(): Promise<void> {
    await mkdir(this.brainDir, { recursive: true });
  }

  async projectRun(run: WorkflowRun): Promise<string> {
    await this.init();

    const filePath = path.join(this.brainDir, `SDLC-${run.runId}.md`);
    const tempPath = `${filePath}.tmp.${Date.now()}`;

    const latestQa = run.qaReports[run.qaReports.length - 1];
    const latestTriage = run.triageRecords[run.triageRecords.length - 1];

    const markdown = `# SDLC Run: ${run.runId}

**Objective:** ${run.objective}  
**Current State:** \`${run.state}\`  
**Execution Mode:** \`${run.mode}\`  
**Created At:** ${run.createdAt}  
**Last Updated:** ${run.updatedAt}

---

## 1. Governance & Approval Gates

- **Gate A (Plan Approval):** ${
      run.approvals.plan
        ? `✅ Approved by ${run.approvals.plan.approver} at ${run.approvals.plan.timestamp}`
        : "⏳ Awaiting Plan Approval"
    }
- **Gate B (Story Approval):** ${
      run.approvals.story
        ? `✅ Approved by ${run.approvals.story.approver} at ${run.approvals.story.timestamp}`
        : "⏳ Awaiting Story Approval"
    }

---

## 2. Story Scope & Acceptance Criteria

**Title:** ${run.story.title || "Pending Definition"}  
**Linear Story ID:** ${run.story.linearId || "N/A"}  

### Requirements
${
  run.story.requirements.length > 0
    ? run.story.requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")
    : "_Pending requirements discovery_"
}

### Acceptance Criteria
${
  run.story.acceptanceCriteria.length > 0
    ? run.story.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")
    : "_Pending criteria definition_"
}

---

## 3. Task Graph & Work Items

| Task ID | Role | Status | Retries | Candidate SHA | PR Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
${
  run.story.tasks.length > 0
    ? run.story.tasks
        .map(
          (t) =>
            `| ${t.id} | ${t.assignedRole} | \`${t.status}\` | ${t.retryCount}/${t.maxRetries} | ${t.candidateSha ? `\`${t.candidateSha.substring(0, 7)}\`` : "-"} | ${t.prUrl ? `[#${t.prNumber}](${t.prUrl})` : "-"} |`,
        )
        .join("\n")
    : "| - | - | _No tasks decomposed_ | - | - | - |"
}

---

## 4. Verification & QA Status

- **Latest Verdict:** ${
      latestQa
        ? `**${latestQa.verdict}** (Tested Commit: \`${latestQa.testedSha.substring(0, 7)}\`)`
        : "_Not yet verified_"
    }
${
  latestQa
    ? `- Unit Tests: ${latestQa.evidence.unitTests.passed} passed, ${latestQa.evidence.unitTests.failed} failed
- Test Integrity: ${latestQa.evidence.integrityVerified ? "✅ Verified" : "❌ Violations Detected"}
- Lint & Types: ${latestQa.evidence.lintPassed && latestQa.evidence.typeCheckPassed ? "✅ Passed" : "❌ Failed"}`
    : ""
}

${
  latestTriage
    ? `### Triage Details
- **Root Cause:** \`${latestTriage.rootCauseCategory}\`
- **Analysis:** ${latestTriage.analysis}
- **Recommended Action:** ${latestTriage.recommendedAction}
- **Routed To:** \`${latestTriage.targetRole}\``
    : ""
}

---

## 5. Staging Release Manifest

${
  run.releaseManifest
    ? `- **Status:** Released to Staging (${run.releaseManifest.timestamp})
- **Deployment ID:** \`${run.releaseManifest.stagingDeploymentId}\`
- **Smoke Tests:** ${run.releaseManifest.smokeTestsPassed ? "✅ Passed" : "❌ Failed"}`
    : "_Awaiting Gate B Story Approval & Staging Deployment_"
}
`;

    await writeFile(tempPath, redactSecrets(markdown), "utf8");
    await rename(tempPath, filePath);
    return filePath;
  }
}
