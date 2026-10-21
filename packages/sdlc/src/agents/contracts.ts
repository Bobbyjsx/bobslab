import { UnauthorizedActionError } from "../core/errors.js";
import type { AgentRole } from "../core/types.js";

export interface AgentContract {
  role: AgentRole;
  description: string;
  allowedTools: string[];
  forbiddenActions: string[];
}

export const AGENT_CONTRACTS: Record<AgentRole, AgentContract> = {
  orchestrator: {
    role: "orchestrator",
    description: "Product manager and workflow coordinator. Never writes application code, reviews code, authors tests, or authorizes releases alone.",
    allowedTools: ["linear_update", "query_status", "ask_human", "record_approval", "dispatch_worker"],
    forbiddenActions: ["write_file", "edit_file", "run_test", "merge_pr", "deploy_staging", "approve_own_work"],
  },
  architect: {
    role: "architect",
    description: "Read-only technical investigator and planner. Inspects architecture, dependencies, and produces the technical plan.",
    allowedTools: ["read_file", "search_repo", "grep", "ast_search"],
    forbiddenActions: ["write_file", "edit_file", "run_command", "git_commit", "git_push"],
  },
  implementer: {
    role: "implementer",
    description: "Feature code author working within an isolated git worktree on its assigned task branch.",
    allowedTools: ["read_file", "write_file", "edit_file", "run_command", "git_commit", "git_push", "open_pr"],
    forbiddenActions: ["approve_pr", "merge_pr", "waive_tests", "modify_base_branch"],
  },
  "test-engineer": {
    role: "test-engineer",
    description: "Requirements-driven test author. Creates unit, integration, and E2E tests without weakening assertions.",
    allowedTools: ["read_file", "write_file", "edit_file", "run_test", "git_commit"],
    forbiddenActions: ["weaken_assertions", "skip_tests", "approve_implementation"],
  },
  "qa-agent": {
    role: "qa-agent",
    description: "Independent verifier. Tests exact candidate commit SHA without modifying code or tests.",
    allowedTools: ["checkout_commit", "run_test", "run_linter", "run_typecheck", "emit_verdict"],
    forbiddenActions: ["write_file", "edit_file", "modify_tests", "waive_failures"],
  },
  "triage-agent": {
    role: "triage-agent",
    description: "Defect analyzer. Diagnoses root cause and routes work to implementation, test, or human intervention.",
    allowedTools: ["read_file", "inspect_logs", "analyze_diff", "emit_triage_record"],
    forbiddenActions: ["waive_gate", "declare_failure_harmless", "edit_file"],
  },
  "release-agent": {
    role: "release-agent",
    description: "Staging release executor. Merges approved PRs, deploys to staging, and executes smoke tests.",
    allowedTools: ["verify_gate_b", "merge_pr", "deploy_staging", "run_smoke_tests", "record_manifest"],
    forbiddenActions: ["deploy_production", "merge_without_approval", "bypass_branch_protection"],
  },
};

export function enforceContract(role: AgentRole, action: string): void {
  const contract = AGENT_CONTRACTS[role];
  if (contract.forbiddenActions.includes(action)) {
    throw new UnauthorizedActionError(role, action);
  }
}
