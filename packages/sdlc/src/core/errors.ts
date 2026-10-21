export class SdlcError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SdlcError";
  }
}

export class InvalidStateTransitionError extends SdlcError {
  constructor(from: string, to: string, reason?: string) {
    super(`Invalid workflow state transition: cannot transition from ${from} to ${to}${reason ? ` (${reason})` : ""}`);
    this.name = "InvalidStateTransitionError";
  }
}

export class UnauthorizedActionError extends SdlcError {
  constructor(role: string, action: string) {
    super(`Role "${role}" is not authorized to perform action "${action}".`);
    this.name = "UnauthorizedActionError";
  }
}

export class TestIntegrityViolationError extends SdlcError {
  constructor(violations: string[]) {
    super(`Test integrity violations detected:\n${violations.map((v) => `  - ${v}`).join("\n")}`);
    this.name = "TestIntegrityViolationError";
  }
}

export class MissingApprovalError extends SdlcError {
  constructor(gate: "PLAN" | "STORY") {
    super(`Missing required human approval for Gate ${gate}. Operation cannot proceed.`);
    this.name = "MissingApprovalError";
  }
}

export class RetryBudgetExceededError extends SdlcError {
  constructor(task: string, count: number) {
    super(`Retry budget of ${count} exceeded for task "${task}". Halting for human triage.`);
    this.name = "RetryBudgetExceededError";
  }
}
