import type { StoryDefinition, TaskItem, QAReport } from "../core/types.js";

export interface LinearIssue {
  id: string;
  key: string;
  title: string;
  description: string;
  state: "Todo" | "In Progress" | "In Review" | "Done" | "Canceled" | "Triage";
  parentId?: string;
  assignee?: string;
  prUrl?: string;
}

export class LinearIntegration {
  private issues: Map<string, LinearIssue> = new Map();
  private idempotencyMap: Map<string, string> = new Map();
  private issueCounter = 100;

  constructor(private teamPrefix: string = "BOB") {}

  async createStoryIssue(story: StoryDefinition, idempotencyKey?: string): Promise<string> {
    if (idempotencyKey && this.idempotencyMap.has(idempotencyKey)) {
      return this.idempotencyMap.get(idempotencyKey)!;
    }

    const existing = Array.from(this.issues.values()).find((i) => i.title === story.title);
    if (existing && idempotencyKey) {
      this.idempotencyMap.set(idempotencyKey, existing.key);
      return existing.key;
    }

    this.issueCounter += 1;
    const key = `${this.teamPrefix}-${this.issueCounter}`;
    const id = `linear_issue_${key}`;

    const issue: LinearIssue = {
      id,
      key,
      title: story.title,
      description: `**Problem:** ${story.problemStatement}\n\n**Outcome:** ${story.desiredOutcome}`,
      state: "In Progress",
    };

    this.issues.set(id, issue);
    if (idempotencyKey) {
      this.idempotencyMap.set(idempotencyKey, key);
    }
    return key;
  }

  async createTaskIssues(storyKey: string, tasks: TaskItem[]): Promise<Map<string, string>> {
    const taskKeyMap = new Map<string, string>();

    for (const task of tasks) {
      this.issueCounter += 1;
      const key = `${this.teamPrefix}-${this.issueCounter}`;
      const id = `linear_task_${key}`;

      this.issues.set(id, {
        id,
        key,
        title: task.title,
        description: task.description,
        state: "Todo",
        parentId: storyKey,
        assignee: task.assignedRole,
      });

      taskKeyMap.set(task.id, key);
    }

    return taskKeyMap;
  }

  async updateStatus(issueKey: string, state: LinearIssue["state"]): Promise<void> {
    const issue = Array.from(this.issues.values()).find((i) => i.key === issueKey);
    if (issue) {
      issue.state = state;
    }
  }

  async attachQAReport(issueKey: string, qaReport: QAReport): Promise<void> {
    const issue = Array.from(this.issues.values()).find((i) => i.key === issueKey);
    if (issue) {
      issue.description += `\n\n### QA Verdict: ${qaReport.verdict}\n- Tested Commit: \`${qaReport.testedSha.substring(0, 7)}\`\n- ${qaReport.summary}`;
      if (qaReport.verdict === "FAIL") {
        issue.state = "Triage";
      }
    }
  }

  getIssue(key: string): LinearIssue | undefined {
    return Array.from(this.issues.values()).find((i) => i.key === key);
  }
}
