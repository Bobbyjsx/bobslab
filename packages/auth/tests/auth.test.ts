import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  authManager,
  decodeJwtClaims,
  getErrorMessage,
  isServerError,
  isTokenExpired,
  transformServerErrorToString,
} from "../src/index";

describe("@bobslab/auth", () => {
  beforeEach(() => {
    authManager.clear();
  });

  describe("authManager", () => {
    it("manages tokens and emits events", () => {
      const listener = vi.fn();
      const unsub = authManager.subscribe(listener);

      authManager.setTokens({ accessToken: "abc" });
      expect(authManager.getAccessToken()).toBe("abc");
      expect(listener).toHaveBeenCalledWith("login", { accessToken: "abc" });

      authManager.clear();
      expect(authManager.getAccessToken()).toBeNull();
      expect(listener).toHaveBeenCalledWith("logout", undefined);

      unsub();
    });

    it("deduplicates in-flight refresh requests", async () => {
      let callCount = 0;
      authManager.setRefreshHandler(async () => {
        callCount++;
        await new Promise((r) => setTimeout(r, 50));
        return { accessToken: "refreshed-token" };
      });

      const [res1, res2] = await Promise.all([
        authManager.refreshToken(),
        authManager.refreshToken(),
      ]);

      expect(callCount).toBe(1);
      expect(res1?.accessToken).toBe("refreshed-token");
      expect(res2?.accessToken).toBe("refreshed-token");
      expect(authManager.getAccessToken()).toBe("refreshed-token");
    });
  });

  describe("JWT tokens", () => {
    it("decodes claims and checks expiration", () => {
      // Header: {"alg":"none"}, Payload: {"sub":"user123","exp":9999999999}
      const validToken =
        "eyJhbGciOiJub25lIn0.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjo5OTk5OTk5OTk5fQ.";
      const claims = decodeJwtClaims(validToken);
      expect(claims?.sub).toBe("user123");
      expect(isTokenExpired(validToken)).toBe(false);

      // Expired token (exp in past)
      const expiredToken =
        "eyJhbGciOiJub25lIn0.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxMDAwMH0.";
      expect(isTokenExpired(expiredToken)).toBe(true);
    });
  });

  describe("error handling", () => {
    it("detects and extracts error messages", () => {
      const errStr = transformServerErrorToString(
        new Error("Database connection failed"),
      );
      const serverErr = { error: errStr, isServerActionError: true as const };

      expect(isServerError(serverErr)).toBe(true);
      expect(getErrorMessage(serverErr)).toBe("Database connection failed");
    });
  });
});
