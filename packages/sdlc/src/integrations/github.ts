import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

export interface PullRequestRecord {
  number: number;
  url: string;
  headBranch: string;
  baseBranch: string;
  title: string;
  candidateSha: string;
  isMerged: boolean;
}

export class GitHubIntegration {
  private prs: Map<number, PullRequestRecord> = new Map();
  private idempotencyMap: Map<string, PullRequestRecord> = new Map();
  private prCounter = 200;
  private worktreesDir: string;

  constructor(private workspaceRoot: string = process.cwd()) {
    this.worktreesDir = path.join(this.workspaceRoot, ".factory", "worktrees");
  }

  async setupTaskWorktree(taskKey: string, branchName: string): Promise<{ worktreePath: string; branch: string }> {
    const worktreePath = path.join(this.worktreesDir, `sdlc-${taskKey}`);
    await mkdir(worktreePath, { recursive: true });
    return { worktreePath, branch: branchName };
  }

  async cleanupWorktree(worktreePath: string): Promise<void> {
    try {
      await rm(worktreePath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error if already removed
    }
  }

  async openPullRequest(params: {
    title: string;
    headBranch: string;
    baseBranch: string;
    body: string;
    candidateSha: string;
    idempotencyKey?: string;
  }): Promise<PullRequestRecord> {
    if (params.idempotencyKey && this.idempotencyMap.has(params.idempotencyKey)) {
      return this.idempotencyMap.get(params.idempotencyKey)!;
    }

    const existing = Array.from(this.prs.values()).find((p) => p.headBranch === params.headBranch);
    if (existing && params.idempotencyKey) {
      this.idempotencyMap.set(params.idempotencyKey, existing);
      return existing;
    }

    this.prCounter += 1;
    const number = this.prCounter;
    const url = `https://github.com/bobslab/bobslab/pull/${number}`;

    const pr: PullRequestRecord = {
      number,
      url,
      headBranch: params.headBranch,
      baseBranch: params.baseBranch,
      title: params.title,
      candidateSha: params.candidateSha,
      isMerged: false,
    };

    this.prs.set(number, pr);
    if (params.idempotencyKey) {
      this.idempotencyMap.set(params.idempotencyKey, pr);
    }
    return pr;
  }

  async mergePullRequest(prNumber: number, authorized: boolean): Promise<{ merged: boolean; sha: string }> {
    if (!authorized) {
      throw new Error(`Cannot merge PR #${prNumber} without Gate B Story Approval.`);
    }

    const pr = this.prs.get(prNumber);
    if (!pr) {
      throw new Error(`PR #${prNumber} not found.`);
    }

    pr.isMerged = true;
    return {
      merged: true,
      sha: pr.candidateSha,
    };
  }

  getPullRequest(prNumber: number): PullRequestRecord | undefined {
    return this.prs.get(prNumber);
  }
}
