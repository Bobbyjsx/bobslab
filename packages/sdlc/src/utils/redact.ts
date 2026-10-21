const SECRET_PATTERNS: RegExp[] = [
  /ghp_[a-zA-Z0-9]{36,}/g,
  /gho_[a-zA-Z0-9]{36,}/g,
  /github_pat_[a-zA-Z0-9_]{36,}/g,
  /sk-[a-zA-Z0-9]{20,}/g,
  /lin_api_[a-zA-Z0-9]{20,}/g,
  /Bearer\s+[a-zA-Z0-9_\-\.]+/gi,
  /(password|secret|api[_-]?key|token)\s*[:=]\s*["']?([^"',;\s]+)["']?/gi,
];

/**
 * Redacts tokens, API keys, passwords, and secrets from text strings.
 */
export function redactSecrets(input: string): string {
  if (!input || typeof input !== "string") {
    return input;
  }

  let result = input;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, (match) => {
      if (match.toLowerCase().startsWith("bearer ")) {
        return "Bearer [REDACTED]";
      }
      if (match.includes(":") || match.includes("=")) {
        const parts = match.split(/([:=])/);
        return `${parts[0]}${parts[1]}[REDACTED]`;
      }
      return "[REDACTED]";
    });
  }

  return result;
}

/**
 * Deeply traverses an object or array and redacts secret values.
 */
export function redactObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    return redactSecrets(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const copy: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (/password|secret|token|apiKey|api_key/i.test(key) && typeof value === "string") {
        copy[key] = "[REDACTED]";
      } else {
        copy[key] = redactObject(value);
      }
    }
    return copy as T;
  }

  return obj;
}
