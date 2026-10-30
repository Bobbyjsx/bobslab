"use client";

import * as React from "react";
import { authManager, decodeJwtClaims, isTokenExpired } from "@bobslab/auth";
import { Badge, Button } from "@bobslab/ui";

export function AuthDemo() {
  // Sample JWT with exp set to future (1 hour from now)
  const [token, setToken] = React.useState(() => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        sub: "user_4981",
        email: "engineer@bobslab.xyz",
        roles: ["admin", "developer"],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: "https://auth.bobslab.xyz",
      }),
    );
    return `${header}.${payload}.signature_bytes`;
  });

  const claims = decodeJwtClaims(token);
  const expired = isTokenExpired(token, 0);
  const [appliedHeaders, setAppliedHeaders] = React.useState<
    Record<string, string>
  >({});

  React.useEffect(() => {
    authManager.setTokens({
      accessToken: token,
      refreshToken: "sample_refresh_token_xyz",
    });
    const req: { headers: Record<string, string> } = {
      headers: { "Content-Type": "application/json" },
    };
    authManager.applyAuthTokenToReq(req).then(() => {
      setAppliedHeaders(req.headers);
    });
  }, [token]);

  const handleExpireToken = () => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        sub: "user_4981",
        email: "engineer@bobslab.xyz",
        roles: ["developer"],
        exp: Math.floor(Date.now() / 1000) - 60,
        iss: "https://auth.bobslab.xyz",
      }),
    );
    setToken(`${header}.${payload}.signature_bytes`);
  };

  const handleFreshToken = () => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        sub: "user_4981",
        email: "engineer@bobslab.xyz",
        roles: ["admin", "developer"],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: "https://auth.bobslab.xyz",
      }),
    );
    setToken(`${header}.${payload}.signature_bytes`);
  };

  return (
    <div className="w-full my-6 flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Token Status:
          </span>
          <Badge variant={expired ? "danger" : "default"}>
            {expired ? "Expired" : "Active (Valid)"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button size="xs" variant="outline" onClick={handleExpireToken}>
            Simulate Expired Token
          </Button>
          <Button size="xs" onClick={handleFreshToken}>
            Refresh Token
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">
          Raw JWT Token:
        </label>
        <textarea
          rows={2}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full rounded-xl border border-border bg-muted/20 p-2.5 text-xs font-mono text-foreground outline-none"
        />
      </div>

      <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-2">
        <span className="text-xs font-semibold text-foreground">
          Decoded Claims ({claims ? "Valid Payload" : "Invalid Token"}):
        </span>
        <pre className="text-xs font-mono bg-background p-3 rounded-lg border border-border/80 overflow-x-auto text-foreground">
          {claims ? JSON.stringify(claims, null, 2) : "null"}
        </pre>
      </div>

      <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-2">
        <span className="text-xs font-semibold text-foreground">
          AuthManager Applied Request Headers (via{" "}
          <code>applyAuthTokenToReq</code>):
        </span>
        <pre className="text-xs font-mono bg-background p-3 rounded-lg border border-border/80 overflow-x-auto text-foreground">
          {JSON.stringify(appliedHeaders, null, 2)}
        </pre>
      </div>
    </div>
  );
}
