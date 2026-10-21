import { InvalidStateTransitionError } from "./errors.js";
import type { WorkflowState } from "./types.js";

export const ALLOWED_TRANSITIONS: Record<WorkflowState, WorkflowState[]> = {
  INTAKE: ["DISCOVERY", "CANCELLED"],
  DISCOVERY: ["AWAITING_PLAN_APPROVAL", "BLOCKED", "CANCELLED"],
  AWAITING_PLAN_APPROVAL: ["PLANNING_ONLY", "DECOMPOSITION", "DISCOVERY", "CANCELLED"],
  PLANNING_ONLY: ["COMPLETED", "CANCELLED"],
  DECOMPOSITION: ["IMPLEMENTATION", "BLOCKED", "CANCELLED"],
  IMPLEMENTATION: ["TEST_AUTHORING", "BLOCKED", "CANCELLED"],
  TEST_AUTHORING: ["QA", "BLOCKED", "CANCELLED"],
  QA: ["READY_FOR_HUMAN_REVIEW", "TRIAGE", "BLOCKED"],
  TRIAGE: ["IMPLEMENTATION", "TEST_AUTHORING", "AWAITING_HUMAN", "FAILED"],
  BLOCKED: ["DISCOVERY", "IMPLEMENTATION", "AWAITING_HUMAN", "CANCELLED"],
  AWAITING_HUMAN: ["DISCOVERY", "IMPLEMENTATION", "TRIAGE", "CANCELLED"],
  READY_FOR_HUMAN_REVIEW: ["AWAITING_STORY_APPROVAL", "CANCELLED"],
  AWAITING_STORY_APPROVAL: ["RELEASE", "IMPLEMENTATION", "CANCELLED"],
  RELEASE: ["STAGING_VERIFICATION", "FAILED"],
  STAGING_VERIFICATION: ["COMPLETED", "TRIAGE", "FAILED"],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
};

export function canTransition(from: WorkflowState, to: WorkflowState): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function validateTransition(from: WorkflowState, to: WorkflowState, reason?: string): void {
  if (!canTransition(from, to)) {
    throw new InvalidStateTransitionError(from, to, reason);
  }
}
