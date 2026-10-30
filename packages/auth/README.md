# @bobslab/auth

In-memory token lifecycle manager, browser session coordinator, client-side JWT claim decoder, and proactive expiration calculators.

## Installation

```bash
# npm
npm install @bobslab/auth

# pnpm
pnpm add @bobslab/auth

# yarn
yarn add @bobslab/auth
```

## Features

- **In-flight Deduplication**: Multiple simultaneous API requests wait on a single in-flight token refresh promise.
- **Session Resolving & Caching**: Cache active browser sessions with automated TTL and in-flight deduplication.
- **Header Application**: Apply `Authorization: Bearer <token>` and `X-Refresh-Token` headers to standard request configs (`applyAuthTokenToReq`).
- **Cross-Tab Synchronization**: Automatically broadcast and sync auth state across browser tabs via `storage` events.
- **JWT Claim Decoder**: Safely decode claims and evaluate token expiration with custom safety buffers.

## Usage

### 1. `AuthManager` Setup

```ts
import { authManager } from "@bobslab/auth";

// Configure token refresh handler
authManager.setRefreshHandler(async () => {
  const res = await fetch("/api/auth/refresh", { method: "POST" });
  if (!res.ok) return null;
  return await res.json();
});

// Configure session resolver
authManager.setSessionResolver(async () => {
  const res = await fetch("/api/auth/session");
  if (!res.ok) return null;
  return await res.json();
});

// Subscribe to auth lifecycle events
authManager.on("login", (tokens) => {
  console.log("Logged in:", tokens);
});

authManager.on("logout", () => {
  console.log("Logged out");
});

// Apply headers to outgoing requests
const requestConfig = {
  headers: { "Content-Type": "application/json" },
};
await authManager.applyAuthTokenToReq(requestConfig);
```

### 2. Cross-Tab Sync

```ts
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => authManager.handleStorageEvent(e));
}
```

### 3. JWT Claims & Expiration

```ts
import { decodeJwtClaims, isTokenExpired } from "@bobslab/auth";

const token = "eyJhbGci...";
const claims = decodeJwtClaims(token);
const isExpired = isTokenExpired(token, 30); // 30s buffer
```

## License

MIT © [Godswill Ezeala](https://godswillezeala.online/)
