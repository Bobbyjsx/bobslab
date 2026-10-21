/** Represents an expected, actionable ai-skills operation failure. */
export class AiSkillsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiSkillsError";
  }
}
