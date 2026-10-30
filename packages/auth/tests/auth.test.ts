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

    it("seeds session and applies auth headers to requests", async () => {
      authManager.seedSession({
        accessToken: "sess-token-123",
        refreshToken: "sess-refresh-456",
        user: { id: "u1", email: "test@bobslab.xyz" },
      });

      expect(authManager.getAccessToken()).toBe("sess-token-123");

      const reqConfig = { headers: {} as Record<string, string> };
      await authManager.applyAuthTokenToReq(reqConfig);

      expect(reqConfig.headers["Authorization"]).toBe("Bearer sess-token-123");
      expect(reqConfig.headers["X-Refresh-Token"]).toBe("sess-refresh-456");

      // Updates tokens and verifies sync handler
      const syncFn = vi.fn();
      authManager.setTokenSyncHandler(syncFn);
      await authManager.updateTokens("new-token-789", "new-refresh-999");

      expect(authManager.getAccessToken()).toBe("new-token-789");
      expect(syncFn).toHaveBeenCalledWith({
        accessToken: "new-token-789",
        refreshToken: "new-refresh-999",
      });

      const updatedReq = { headers: {} as Record<string, string> };
      await authManager.applyAuthTokenToReq(updatedReq);
      expect(updatedReq.headers["Authorization"]).toBe("Bearer new-token-789");
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
