export interface SseBlock {
  event: string;
  data: string;
}

export const SAFE_UNAVAILABLE_MESSAGE =
  "The AI service is temporarily unavailable. Please try again or select another model.";

/**
 * Sanitizes backend error details to ensure internal provider infrastructure,
 * expired tokens, AWS/IAM credentials, and raw stack traces are never leaked.
 */
export function sanitizeStreamErrorText(detail: string, code?: string): string {
  if (code === "MODEL_NOT_FOUND") {
    return "This model is no longer available. Please pick a different model and try again.";
  }

  if (code === "AUTHENTICATION_FAILED") {
    return SAFE_UNAVAILABLE_MESSAGE;
  }

  const lower = detail.toLowerCase();
  const sensitivePatterns = [
    "bearer token",
    "aws bedrock",
    "aws_",
    "iam credentials",
    "api_key",
    "api key",
    "access key",
    "secret key",
    "authentication failed",
    "token has expired",
    "traceback",
    'file "',
  ];

  if (sensitivePatterns.some((pat) => lower.includes(pat))) {
    return SAFE_UNAVAILABLE_MESSAGE;
  }

  if (detail.length > 300) {
    return "An error occurred while generating the response. Please try again.";
  }

  return detail;
}

/**
 * Splits a raw SSE block into its event name and JSON data payload.
 */
export function parseSseBlock(block: string): SseBlock | null {
  const lines = block.split("\n");
  let event = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}

/**
 * Parses the SSE data line into a JSON object, or null if invalid.
 */
export function parseEventPayload(data: string): Record<string, unknown> | null {
  try {
    return JSON.parse(data) as Record<string, unknown>;
  } catch {
    return null;
  }
}
