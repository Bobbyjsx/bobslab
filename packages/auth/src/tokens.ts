export interface JwtClaims {
  sub?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
  email?: string;
  roles?: string[];
  [key: string]: unknown;
}

/**
 * Decodes standard JWT payload without requiring full crypto verify on client.
 */
export function decodeJwtClaims<T extends JwtClaims = JwtClaims>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired, factoring in an optional safety buffer in seconds.
 */
export function isTokenExpired(token: string, bufferSeconds: number = 30): boolean {
  const claims = decodeJwtClaims(token);
  if (!claims || !claims.exp) return true;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return claims.exp <= nowSeconds + bufferSeconds;
}
