---
name: python-backend
description: "Authoritative engineering guidelines for Python and FastAPI backend services: async-first architecture, layered router/service/repository pattern, Pydantic v2 data models, Firestore with emulator testing, security invariants (JWT, IDOR, constant-time auth), and anti-patterns."
tags: [python, backend, fastapi, firestore, architecture, security, standards]
version: 1.0.0
---

# Python Backend Engineering Guidelines

## Purpose
Governs the architecture, implementation, security, testing, and operational standards for Python backend services across this workspace. Derived from production workspace services (`cognito-chat-api`, `keysentry-api`, `identity-service`, `project-atlas`).

Whenever you are creating, modifying, or refactoring Python code, services, or infrastructure, you MUST strictly apply these standards.

---

## Minimum Quality Bar for Any Python Change

Every Python change must satisfy these baseline requirements before being marked complete:
1. **Ruff-Clean**: Passes `ruff check .` and `ruff format --check .` (line-length 120).
2. **Type-Checked**: Passes `pyright` at `basic` mode without type errors where `pyrightconfig.json` exists.
3. **Tests Pass**: All tests pass via pytest against the Firestore emulator (or mock-free test suite); no `|| true` masking.
4. **No Insecure Defaults or Secrets**: Zero hardcoded credentials or unverified tokens.
5. **Logging Hygiene**: Zero `print()` calls in application code; lazy `%s` formatting with `logging.getLogger(__name__)`.

---

## Core Architectural Invariants

### 1. Async-First FastAPI
- All route handlers, service methods, and repository operations are `async def`.
- Never run blocking I/O on the main event loop. Offload synchronous SDK calls using `asyncio.to_thread` (e.g. file uploads, blocking third-party libraries).

### 2. Strict Layered Dependency Direction
```
Request
  │
  ▼
Router (HTTP concerns, parameter validation, response_model, DI resolution)
  │
  ▼
Service (Business logic, authorization orchestration, quota checks, error translation)
  │
  ▼
Repository (Datastore queries, transactions, document serialization, *DB models)
  │
  ▼
Datastore (Firestore / Database) & External Integrations
```
- **Routers**: HTTP concerns only. Declare `response_model`, wire dependencies via `Depends`, call exactly one service method, and handle HTTP status codes. No database queries or business rules inside routers.
- **Services**: Pure business logic. Orchestrate validations, perform ownership/quota checks, handle background tasks, and translate repository errors into domain exceptions or `HTTPException`.
- **Repositories**: One class per collection. Return Pydantic `*DB` models, never raw dicts. Never raise `HTTPException` inside a repository.
- **Integrations**: Confined to `integrations/` (or `providers/`). External third-party SDKs must never leak into services or routers. Expose stable, SDK-agnostic domain interfaces.

### 3. Pydantic v2 as the Single Data Model System
- **Wire Schemas (`app/schemas/`)**: `*Create`, `*Update`, `*Response` models with `Field` validation constraints (`min_length`, `max_length`, `le`, `ge`).
- **Datastore Documents (`app/models/`)**: `*DB` models (e.g. `UserDB`, `ChatSessionDB`).
- **Configuration (`app/core/config.py`)**: `pydantic-settings` `BaseSettings` with `SettingsConfigDict(env_file=".env", extra="ignore")`.
- **Secrets Protection**: Never serialize secrets in schemas. Use `Field(exclude=True)` and `@computed_field` to verify presence without exposing raw keys.

### 4. Firestore Data Access & Transaction Patterns
- Use `google.cloud.firestore_v1.async_client.AsyncClient` created once during app lifespan on `app.state`.
- **Server-Side Transactions**: Mandatory for read-modify-write invariants (quota increments, state transitions, single-use tokens).
- **Atomic Counters**: Use Firestore `Increment` transforms; never read-then-write counters in separate operations.
- **Batch Writes**: Use `db.batch()` for multi-document operations (e.g. message + session timestamp update).
- **Tenancy & IDOR Prevention**: Always perform post-fetch tenant/user ownership checks in repositories or services (`assert resource.user_id == current_user.id`). Never rely on Firestore client security rules alone.

### 5. Mandatory Security Standards
- **JWT Verification**: Always verify both `issuer` and `audience`. Setting `verify_aud: False` is strictly forbidden.
- **Constant-Time Comparison**: Compare all secrets, API keys, and internal webhook tokens with `hmac.compare_digest`—never standard `==` or `!=`.
- **CORS Invariant**: Never configure `allow_origins=["*"]` with `allow_credentials=True`. Explicitly enumerate allowed origins.
- **Password & Token Storage**: Use **Argon2id** for password hashing. Store opaque tokens (refresh tokens, OTPs, API keys) as SHA-256 hashes.
- **Security Headers**: Mount middleware providing HSTS, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.

### 6. Testing with the Firestore Emulator
- Integration tests must run against the **Firestore emulator** (`127.0.0.1:8080`), configured via `FIRESTORE_EMULATOR_HOST` in `tests/conftest.py` before application import.
- **Zero Mocking of Firebase**: Do not mock `firebase_admin` or `AsyncClient`. The emulator provides real datastore semantics.
- **Database Wipe**: Execute an autouse test fixture that wipes the emulator database between test runs.
- **Async Test Client**: Prefer `httpx.ASGITransport` + `asgi_lifespan.LifespanManager` over synchronous `TestClient` to ensure startup/shutdown lifespan events run.

---

## Canonical Project Directory Layout

```text
project/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app: lifespan, middleware, exception handlers, /health
│   ├── dependencies.py         # DI wiring (get_db, get_current_user, get_x_service)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # pydantic-settings Settings singleton
│   │   ├── database.py         # Firestore AsyncClient init + get_db dependency
│   │   ├── security.py         # JWT verification, password hashing, hmac comparison
│   │   ├── errors.py           # Domain exception hierarchy + stable error codes
│   │   ├── logger.py           # Logger configuration + RequestLoggingMiddleware
│   │   └── cache.py            # Optional fail-open Redis client
│   ├── routers/                # One router module per resource/domain (/api/v1/...)
│   │   ├── __init__.py
│   │   ├── health.py           # GET /health
│   │   └── <domain>.py
│   ├── schemas/                # Pydantic request/response wire models (*Create, *Update, *Response)
│   ├── models/                 # Pydantic datastore document models (*DB)
│   ├── repositories/           # Firestore data access (one class per collection)
│   ├── services/               # Business logic, authorization orchestration
│   ├── integrations/           # External API & SDK clients (behind stable domain interfaces)
│   └── utils/                  # Tiny pure helpers (datetime, mime)
├── tests/
│   ├── conftest.py             # Emulator env, wipe fixture, async lifespan client, auth bypass
│   ├── api/                    # Endpoint integration tests
│   └── unit/                   # Service and repository unit tests
├── scripts/                    # Idempotent database migrations and seeding
├── docs/                       # Architecture decisions, endpoint & error code catalog
├── .env.example                # Committed template with dummy values (.env is gitignored)
├── .gitignore
├── .dockerignore
├── Dockerfile                  # python:3.12-slim, non-root user, PORT-driven, HEALTHCHECK
├── Makefile                    # install, dev, lint, format, test, clean
├── pyproject.toml              # Tool configs only: [tool.ruff], [tool.pytest.ini_options]
├── pyrightconfig.json          # venvPath: ".", typeCheckingMode: "basic"
└── requirements.txt            # Pinned direct runtime dependencies (==)
```

---

## Common Anti-Patterns to Ban

| Anti-Pattern | Violation Consequence | Required Remediation |
| :--- | :--- | :--- |
| `allow_origins=["*"]` + credentials | Insecure browser CORS rejection or cross-origin exploit | Use explicit list of trusted frontend origins |
| Hardcoded fallback secrets | Insecure defaults deployed if env var is missing | Fail fast on startup in production if secret is empty |
| `verify_aud: False` in JWT | Accepts tokens minted for arbitrary services | Explicitly pass and verify expected audience |
| Missing ownership checks | IDOR: any user can read or modify another user's data | Enforce `resource.user_id == current_user.id` in service/repo |
| `HTTPException` in repository | Leaks HTTP transport details into data access layer | Raise domain exceptions; translate to HTTP in service/router |
| `==` on secrets / API keys | Timing attack vulnerability | Use `hmac.compare_digest(secret, expected)` |
| `print()` in app code | Unstructured, unroutable, un-monitored logs | Use `logging.getLogger(__name__)` with `%s` formatting |
| Logging request/response bodies | Leaks passwords, tokens, and PII into log streams | Log metadata only (method, path, status, duration) |
| `make test` ending in `\|\| true` | CI reports green while tests are failing | Let test runners fail with non-zero exit codes |
| Manual `firebase_admin` mocks | Mocks drift from real Firestore behavior | Run tests against the official Firestore emulator |
| Blocking sync calls in `async def` | Starves the event loop, severely degrading concurrency | Wrap blocking SDK calls in `asyncio.to_thread` |

---

## Anti-Slop Code Standards (`antislop-code`)

When writing or modifying Python code:
- **No Decorative Separators**: Never write `# ====================` or banner boxes.
- **No Restating the Obvious**: Never write `# Initialize variable` above `count = 0`.
- **No Workflow Narration**: Never write `# Step 1: ...`, `# Step 2: ...`.
- **Why > What**: Comments must explain the *why* (non-obvious intent, concurrency constraint, security rationale), never what the code line visibly does. Max 1-2 lines.

---

## Deep Reference Documentation

For detailed analysis of historical workspace services, resolved conventions, and specific implementation snippets:
- Read [`references/PYTHON_PROJECT_GUIDELINES.md`](references/PYTHON_PROJECT_GUIDELINES.md).
