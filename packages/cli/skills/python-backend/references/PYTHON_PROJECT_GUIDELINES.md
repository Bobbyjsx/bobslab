# Python Project Guidelines

The canonical engineering standard for Python services in this workspace. Derived from analysis of the production services `cognito-chat-api`, `keysentry-api`, `identity-service`, and the `project-atlas` gateway/runtime platform. Where the source projects disagree, this document states the deliberate resolution (see "Resolved Conflicts").

## Purpose

Give coding agents a concrete, enforceable standard for building and modifying Python services: async-first FastAPI, layered architecture, Pydantic everywhere, Firestore data access behind repositories, emulator-based testing, Cloud Run deployment.

## Engineering Philosophy

- **Async-first FastAPI.** Handlers, services, and repositories are `async def`. Blocking SDK calls are offloaded with `asyncio.to_thread`, never by blocking the event loop. (All four projects; explicit in cognito-chat-api `app/storage/gcs.py`.)
- **Layered architecture with a strict dependency direction.** `routers → services → repositories → datastore`. HTTP concerns stop at routers; business logic lives in services; data access lives in repositories.
- **Pydantic v2 is the only data model system.** Request/response schemas, datastore documents, and settings are all Pydantic. Dataclasses are acceptable for provider-internal value types (cognito-chat-api `app/providers/base.py`), not for API surfaces.
- **Type hints are mandatory.** All public functions have full annotations. pyright `basic` is the baseline checker.
- **Configuration is environment-driven, never hardcoded.** Secrets live in env vars / Secret Manager, read once through a `Settings` singleton.
- **Tests run against the Firestore emulator**, not production data, and the DB is wiped between tests.
- **Deploy target is Google Cloud Run.** Single-container images, `PORT`-driven, credentials via ADC or env-injected secrets.

## Project Structure

Standard layout (adapted from cognito-chat-api and identity-service):

```text
project/
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI app: lifespan, middleware, exception handlers, health
│   ├── dependencies.py       # DI wiring and auth dependencies
│   ├── core/
│   │   ├── config.py         # pydantic-settings Settings singleton
│   │   ├── database.py       # Firestore init + AsyncClient + get_db dependency
│   │   ├── security.py       # token verification, auth dependencies
│   │   ├── errors.py         # domain exception hierarchy + error codes
│   │   ├── logger.py         # logger config + request-logging middleware
│   │   └── cache.py          # optional Redis cache client (fail-open)
│   ├── routers/              # FastAPI routers, one per resource/domain
│   │   └── health.py, auth.py, ...
│   ├── schemas/              # Pydantic request/response wire models
│   ├── models/               # Pydantic datastore document models (e.g. UserDB)
│   ├── repositories/         # Firestore data access, one class per collection
│   ├── services/             # business logic, one class per domain
│   ├── integrations/         # external SDK/HTTP clients (providers, webhooks)
│   └── utils/                # small pure helpers (datetime, mime) — keep tiny
├── tests/
│   ├── conftest.py           # emulator env vars, fixtures, auth bypass
│   ├── api/                  # endpoint tests (optional split)
│   └── unit/                 # service/repository unit tests (optional split)
├── scripts/                  # idempotent ops scripts (migrations, seeding)
├── docs/
├── .env.example              # committed template; .env is gitignored
├── .gitignore
├── .dockerignore
├── Dockerfile
├── Makefile
├── pyproject.toml            # tool config only (ruff, pytest) — not a package spec
├── pyrightconfig.json
└── requirements.txt          # pinned direct dependencies
```

Rules:

- Use an `app/` package layout (cognito-chat-api, identity-service). A `src/` layout (keysentry-api) is an acceptable alternative; do not mix the two.
- Every package directory has `__init__.py`. Implicit namespace packages cause import-order bugs (observed in keysentry-api `src/core/` and cognito-chat-api).
- Do not create a `[project]` section in `pyproject.toml` unless the service is genuinely a pip-installable package. These services are applications deployed as images.
- Keep `utils/` minimal: pure helpers only, no business logic, no infrastructure.

## Architecture

Preferred flow:

```text
Request
 → Router (HTTP concerns, DI resolution, response_model)
 → Dependency resolution (auth, db client, service construction)
 → Service (business logic, orchestration, error translation)
 → Repository (Firestore queries, transactions, document serialization)
 → Datastore / external integration
 → Pydantic response model → Response
```

- **Routers** declare `response_model`, wire dependencies, call exactly one service method, and translate nothing beyond `HTTPException` re-raises. No queries, no business rules (violations observed: `ConfigRepository.get_config` raising `HTTPException` in cognito-chat-api `app/repositories/config.py`).
- **Services** contain business logic: validation orchestration, quota checks, background dispatch, cache invalidation, error translation to domain/HTTP errors.
- **Repositories** are per-collection classes holding the `AsyncClient` and exposing the collection. They return Pydantic `*DB` models, never raw dicts, and never raise HTTP exceptions.
- **Integration clients** (AI providers, webhooks, external APIs) are confined to `integrations/` (or `lib/`/`providers/`), behind an interface with stable error types. SDK imports never leak into services or routers (exemplar: cognito-chat-api `app/providers/base.py` — `google.genai` appears only in `providers/gemini.py`).
- **Wiring** uses FastAPI `Depends` with factory functions (`get_db`, `get_x_service`) in `dependencies.py`. Constructing repositories inside services (cognito-chat-api `AgentService`) is tolerated for testability; constructor injection is preferred.
- Business logic does **not** belong in routers, repositories, middleware, or giant utility modules.

## Naming Conventions

- Files/modules: `snake_case.py`. Classes: `PascalCase`. Functions/variables: `snake_case`. Constants: `UPPER_SNAKE`.
- Datastore documents: `*DB` suffix (cognito-chat-api: `UserDB`, `ChatSessionDB`, `AppConfigDB`).
- Wire models: `*Create`, `*Update`, `*Response` (keysentry-api) or `*Request`/`*Response` (cognito-chat-api) — pick one per service; keysentry's `Create/Update/Response` is the cleaner split.
- Repositories: `UserRepository`, methods `get_by_id`, `get_by_field`, `create`, `update`, `delete`, `list_by_<field>`.
- Services: `AuthService`, `AgentService`, `AttachmentService`.
- Routers: module-level `router = APIRouter()`.
- Keep `*DB`, `*Response`, and `*Create` models in separate modules/files per domain (`models/users.py`, `schemas/user.py`).
- Do not name things after implementation that is not there (`get_by_id_for_update` without a transaction — keysentry-api anti-pattern).

## Python Standards

- Python **3.12** as the runtime and CI version (keysentry-api, identity-service, atlas CI). Docker images use `python:3.12-slim`.
- Full type hints on every public function and method; return types included. Use `str | None` syntax, `Annotated` where useful, `collections.abc` for generics (`AsyncIterator`, `Sequence`).
- Prefer **async functions** for anything I/O-bound. Sync SDK calls get wrapped in `asyncio.to_thread` (cognito-chat-api `storage/gcs.py`).
- Use `datetime.now(timezone.utc)` and ISO-8601 strings for persistence; never naive datetimes (violations observed: `datetime.utcnow()` in keysentry-api `tests/utils.py`).
- Use Pydantic for structured data; dataclasses only for SDK-internal value types.
- Enums for closed value sets (`ReadStatus` in cognito-chat-api; `StatusEnum` in identity-service); enforce transitions with explicit maps (`VALID_TRANSITIONS` frozensets in identity-service `schemas/auth_session.py`).
- Module-level singletons are the norm for `settings`, database clients, and app instances — but no other module-level side effects (no `register_events()` at import time; no client creation inside config modules — keysentry-api `main.py:14`, atlas `config.py` anti-patterns).
- Lazy/deferred imports are a symptom of circular dependencies. Fix the module graph (move shared primitives to a dependency-free module) instead of importing inside functions.

## FastAPI Standards

- Module-level `app = FastAPI(title=..., version=..., lifespan=lifespan)` in `app/main.py`; launched via `uvicorn app.main:app`. (No app factory across all four projects.)
- **Lifespan context manager** for startup/shutdown: initialize Firestore, create the shared client on `app.state`, load signing keys, start background tasks; close clients and cancel tasks on shutdown (identity-service `app/main.py:21-36`, cognito-chat-api). Never use the deprecated `@app.on_event` (atlas `gateway/main.py:12`).
- Store shared runtime objects on `app.state` (`app.state.db_client`), expose them via `Depends` functions that read from `request.app.state`.
- Version the API with a `/api/v1` prefix from `settings.API_V1_STR` applied at router inclusion (keysentry-api). Public discovery endpoints (`.well-known`, `/health`, `/docs`) stay unprefixed.
- `GET /health` → `{"status": "ok"}` (liveness). Include a service name only if useful.
- Register exception handlers in `main.py` (see Error Handling).
- `response_model` on every endpoint that returns data. Endpoints with side effects return `{"message": ...}` or `{"success": True}` dicts.
- Pagination: consistent `limit`/`offset` with a generic `PaginatedResponse[T]` (`items`, `total`, `limit`, `offset`, `has_more` — cognito-chat-api `app/models/pagination.py`). Cap `limit` (e.g. `le=1000`). Never mix `page/pageSize` and `skip/limit` in one API (keysentry-api inconsistency).
- SSE endpoints: `StreamingResponse` with `media_type="text/event-stream"`, headers `Cache-Control: no-cache` and `X-Accel-Buffering: no`, errors delivered as `event: error` frames (cognito-chat-api `router/chats.py`, atlas `proxy.py`).
- Route ordering: declare static paths (`/scans/internal/{id}`, `/scans`) **before** parameterized ones (`/scans/{id}`) — FastAPI matches in declaration order (latent misrouting bug in keysentry-api `routers/scans.py`).
- Keep endpoint handlers thin; duplicate route aliases for client compatibility are acceptable but must be intentional.

## Configuration

- **pydantic-settings** `BaseSettings` in `app/core/config.py`, with `SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")`, and a module-level `settings = Settings()` singleton.
- Lowercase field names (cognito-chat-api, identity-service). Uppercase fields with `case_sensitive=True` (keysentry-api) are acceptable but are the minority convention.
- Every env var: define a typed field with a sensible default. Never read `os.getenv` inside properties/methods of `Settings` (atlas `config.py` anti-pattern) and never `load_dotenv()` manually when `env_file` handles it.
- Commit `.env.example` with real var names and placeholder values. Keep it in sync with the `Settings` class — a stale example is a documented trap (identity-service `OAUTH_TRANSACTION_EXPIRATION_MINUTES`, keysentry-api's `DATABASE_URL`/`REDIS_URL` ghosts).
- Required-at-runtime values (API keys, secrets) default to `""` and fail loudly at first use with a clear message — not silently.
- **Never hardcode secrets** — not in code, not as default values. Insecure defaults observed across all four projects (`SECRET_KEY="supersecretkey_please_change_in_production"`, `INTERNAL_API_SECRET="super_secret_webhook_key_123"`, `ENCRYPTION_KEY="change_me_in_production"`, `ADMIN_SECRET="changeme-in-prod"`): an insecure default must fail fast in production (`ENVIRONMENT=production` → refuse to start without `PRIVATE_KEY` — identity-service `key_manager.py`), and warnings must be emitted.
- Never commit `.env`, credential JSON files, or private keys. They are gitignored in all four projects; keep it that way.

## Database

The workspace standard is **Google Cloud Firestore** (3 of 4 services). Relational (PostgreSQL + SQLAlchemy + Alembic) is legacy in this codebase lineage (keysentry-api's `main` branch) — do not introduce it in new services unless explicitly required.

### Firestore

- Async client only: `google.cloud.firestore_v1.async_client.AsyncClient`. Initialize Firebase Admin once, guarded (`if not firebase_admin._apps`), preferring a credential path, falling back to Application Default Credentials for Cloud Run (cognito-chat-api `app/database.py`).
- Create **one shared client** in lifespan, store on `app.state`; `get_db(request)` returns it. No per-request clients.
- One **repository class per collection**. Repositories own collection names and every query. Serialization: `model_dump(mode="json")` in, `Model(**doc.to_dict())` out; always inject `data["id"]`.
- Queries use `FieldFilter`-based `.where(...)` chains with `.limit(1)` for single lookups. Chunk `in` filters at 30 ids (Firestore limit).
- Use **server-side transactions** for read-modify-write invariants: quota enforcement (cognito-chat-api `UserRepository.atomic_increment_if_within_limit`), single-use authorization codes, session state claims (identity-service `auth_session.py`, `authorization_code.py`).
- Retry transactions on `Aborted`/`ValueError` with a bounded retry loop and small backoff; map the losing contender to a well-defined domain error derived from the current document state (identity-service `claim_session` — the reference implementation).
- Use server-side `Increment` transforms for counters; never read-then-write counters outside a transaction.
- Batch multi-document writes with `db.batch()` (message + session update, idempotent webhook ingestion — keysentry-api `lib/webhook.py`).
- Enforce **expiry at read/use time**, not only at write; derive "expired" status on load (`_effective_stored_status` in identity-service).
- Composite indexes go in a committed `firestore.indexes.json`.
- Avoid Python-side filtering/pagination of full streams; if Firestore query limits force it, document the tradeoff (cognito-chat-api `repositories/chats.py`).
- Tenancy: post-fetch `app_id`/`user_id` ownership checks in the repository or service (identity-service `TenantRepository.get_tenant_resource`, cognito-chat-api ownership guards). Never rely on Firestore security rules alone.

### Relational (legacy only)

If a task touches the legacy PostgreSQL path (keysentry-api `alembic/`): SQLAlchemy async engine with `NullPool` in alembic `env.py`, symmetric `upgrade`/`downgrade` per migration, `alembic revision --autogenerate` via Makefile. Note that this path is currently orphaned in keysentry-api — do not extend it.

## Caching

- Redis (Upstash) is an **optional optimization, never authoritative**. Source of truth is Firestore (cognito-chat-api `app/core/redis.py`: empty `REDIS_URL` disables caching with a warning).
- **Fail-open**: a Redis error or outage must not fail the request (cognito-chat-api logs and serves stale/uncached data).
- Key conventions: central key builder module with static methods (cognito-chat-api `app/core/cache_keys.py`); namespace keys by resource + user id; TTLs per resource (300s user data, 3600s config).
- Invalidate by deleting key prefixes on writes; never rely on TTL alone for correctness.
- Serialize cache payloads with `model_dump(mode="json")` and `json.loads`.
- Do not hand-roll the same get/compute/set block in every router; extract a shared helper.

## External Services

- Confine each integration to its own module/class under `integrations/` (or `lib/`/`providers/`), behind an interface the rest of the app depends on. Only the integration module may import the SDK.
- Define stable, SDK-agnostic error types and map SDK exceptions centrally (cognito-chat-api `app/providers/base.py`: `ProviderError` hierarchy + `classify_provider_error` returning `(status, code, message)` with stable codes like `MODEL_NOT_FOUND`).
- HTTP integrations use a **shared `httpx.AsyncClient`** with tuned timeouts per use case (atlas `gateway/core/config.py`: `connect=10, read=120, write=30, pool=10` for LLM latency); close it in lifespan shutdown.
- Timeouts, retries (bounded, with backoff), and error classification are mandatory for every external call.
- Never embed upstream exception objects or internal hostnames in client-facing error messages (atlas `proxy.py` anti-pattern).
- Background work: `asyncio.create_task` from lifespan for periodic maintenance (cognito-chat-api cleanup loop), a small async event bus for decoupled side effects (keysentry-api `core/events.py`), or a managed worker (Trigger.dev) for heavy jobs. Prefer the external worker for jobs that must survive restarts.

## Authentication and Authorization

- Bearer tokens verified in a `get_current_user` dependency: `HTTPBearer` (keysentry-api, identity-service) or `OAuth2PasswordBearer` (cognito-chat-api).
- Verify tokens with the identity provider's public keys (Firebase Admin `id_token.verify_firebase_token` with cached keys — keysentry-api; JWKS via `PyJWKClient` — cognito-chat-api; own Ed25519 keys + JWKS endpoint — identity-service).
- **Verify issuer and audience.** `options={"verify_aud": False}` is a security bug (cognito-chat-api `dependencies.py:77,89`); the audience config must be enforced.
- Map external string IDs to deterministic internal UUIDs (`uuid.uuid5(uuid.NAMESPACE_OID, ...)` — keysentry-api `core/security.py:34`) for stable identifiers without leaking the provider's ID space.
- Password hashing: **Argon2id** (identity-service). bcrypt via passlib is legacy.
- Secrets (client secrets, tokens) are stored hashed; shown once at creation (identity-service `services/application.py`).
- Opaque tokens (refresh, reset, OTP): store hashed (SHA-256), rotate on use, revoke on sensitive events (password reset revokes refresh tokens).
- Internal service-to-service auth: shared secret in `X-Internal-Token` header, compared with `hmac.compare_digest` — never `!=` (atlas `security.py:31`, keysentry-api inline checks, both non-constant-time).
- **Authorization**: every read/update/delete of a resource must verify the caller owns it. Missing ownership checks are an IDOR vulnerability (keysentry-api `routers/api_keys.py` self-documented gap).
- Reject refresh tokens at access-token verification; require `sub`.

## Error Handling

Three distinct error classes, handled differently:

| Kind                             | Example                                              | Handling                                                                        |
| -------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| Expected business errors         | invalid credentials, session expired, quota exceeded | Domain exceptions or `HTTPException` raised in services; mapped to stable codes |
| Infrastructure/external failures | Firestore down, provider 5xx                         | Log with stack trace, translate to 5xx, never leak internals                    |
| Programming errors               | bugs, type errors                                    | Catch-all handler → 500, logged                                                 |

- Define a small **domain exception hierarchy** in `app/core/errors.py` with machine-readable codes (identity-service `OAuthError(error, error_description, status_code)` rendered as `{"error": ..., "error_description": ...}`; cognito-chat-api provider error codes).
- Register handlers in `main.py`: validation errors → 422 `{"detail": exc.errors()}`; HTTP exceptions → passthrough; catch-all → 500 `{"detail": "Internal Server Error"}` with `logger.exception` (keysentry-api `main.py` is the reference; identity-service adds OAuth-shaped 500s for OAuth paths).
- Never leak stack traces, Firestore paths, or internal hostnames to clients.
- Never `except Exception: pass`. If a failure is intentionally tolerated (fail-open cache), log a warning and degrade deliberately.
- Error responses: keep one shape per service (`{"detail": ...}` or the structured code envelope); do not mix (identity-service intentionally documents two conventions — OAuth endpoints use the RFC 6749 shape, direct APIs use `{"detail": ...}`).
- In streaming/SSE, errors are events in the stream, not raised exceptions.

## Logging and Observability

- Standard `logging` with `logging.getLogger(__name__)` per module.
- Central logger setup in `app/core/logger.py` with a `StreamHandler`; use lazy `%s`-style formatting (`logger.exception("... %s", arg)`) — never f-strings in log calls.
- Log requests via a middleware: method, path, status, duration (keysentry-api `RequestLoggingMiddleware`); level by status class (≥500 error, ≥400 warning, else info).
- Never use `print()` in application code (observed in cognito-chat-api `main.py:30`, keysentry-api `routers/user_data.py:123`); print goes only to dev scripts.
- **Never log**: passwords, tokens, API keys, private keys, request bodies of auth endpoints, or full response bodies on error paths (atlas `proxy.py:102-104` logs full bodies — leak vector).
- Structured JSON logging is not yet used in these services; if added, keep the middleware contract (method/path/status/duration) and never log secrets.

## Validation

- Pydantic v2 `Field` constraints on all wire schemas (`min_length`, `max_length`, `le`, `ge`), `EmailStr` for emails, typed UUIDs for ids.
- `ConfigDict(from_attributes=True)` on response schemas when mapping from models.
- Partial updates: `model_dump(exclude_unset=True)`; reject empty bodies with a clear 400 (keysentry-api `services/api_key.py`).
- **Never serialize secrets**: `Field(exclude=True)` for stored tokens; `@computed_field has_github_token` to reveal presence without leaking value (keysentry-api `schemas/user.py:20-28`).
- Validate at the boundary (schemas) and in domain rules (services); don't scatter ad-hoc checks through routers.

## Testing

- **pytest + pytest-asyncio** (`asyncio_mode = auto`), config in `pyproject.toml` `[tool.pytest.ini_options]` (`testpaths`, `addopts`).
- Integration tests run against the **Firestore emulator** (docker `google/cloud-sdk` emulator on `127.0.0.1:8080`), provisioned as a `firestore` service in `docker-compose.yml` (cognito-chat-api, identity-service) or via `docker run` in the Makefile `test` target (keysentry-api).
- Because the emulator is real infrastructure, **no manual mocking of Firebase is needed**. The emulator replaces Firebase/Firestore entirely: `conftest.py` only sets emulator env vars (`FIRESTORE_EMULATOR_HOST`, `GOOGLE_CLOUD_PROJECT`, `FIRESTORE_DATABASE`) **before importing the app**, and the app's `init_db()` falls back to Application Default Credentials, which the emulator satisfies. identity-service `tests/conftest.py` is the reference pattern — zero `firebase_admin` mocks. cognito-chat-api still carries legacy `patch("firebase_admin.initialize_app")`/`patch("firebase_admin._apps", ...)` stubs; remove them when touching that conftest. The conftest exposes:
  - an app client via `httpx.ASGITransport` + `asgi_lifespan.LifespanManager` (identity-service) — preferred over the sync `TestClient` (cognito-chat-api) because it exercises lifespan;
  - an autouse fixture that **wipes the emulator DB between tests** and reseeds required seed documents (cognito-chat-api `clear_database`);
  - auth bypass by patching token verification (`mock_firebase_verify` in keysentry-api) or setting feature-disable env vars before import (identity-service `TURNSTILE_ENABLED=false`).
- Use `app.dependency_overrides[get_db] = ...` for dependency swaps (keysentry-api) and `unittest.mock.patch`/`AsyncMock` for SDKs (cognito-chat-api `mock_agent`).
- Unit-test the hard parts: SDK-to-domain mapping, tool execution loops, quota/transaction logic, path-traversal rejection.
- Do not mutate global `settings` inside tests (keysentry-api cross-test pollution); set env vars before import instead.
- Tests must match the current API surface — remove or update tests when endpoints are removed (cognito-chat-api still tests deleted `/auth/*` endpoints; the suite is red by construction).
- CI runs tests; a Makefile `test` target ending in `|| true` silently masks failures (keysentry-api) — never do that.

## Dependency Management

- **`requirements.txt` with pinned direct dependencies (`==`)** is the source of truth (keysentry-api, identity-service, atlas pin; cognito-chat-api's unpinned file is the outlier and caused reproducibility issues).
- Do not commit `pip freeze` full outputs; pin the direct dependencies you import, at versions you have tested.
- Keep runtime and dev dependencies **separate** (`requirements-dev.txt`) so dev tools (pytest, ruff) never ship in production images (all four projects currently mix them — don't copy that).
- A `pyproject.toml` without `[project]` is normal here (tool config only: `[tool.ruff]`, `[tool.pytest.ini_options]`).
- Remove dependencies that are no longer imported (celery/redis/PyGithub in keysentry-api, freezegun in cognito-chat-api are dead).
- `uv`/Poetry lockfiles are not used in these projects; if a new project prefers one, keep the requirements.txt contract for the Dockerfile.

## Docker

Reference Dockerfile (as used by all four services):

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001}
```

Improvements over the observed baseline (apply to new services):

- Keep the base image `python:3.12-slim` and the `PORT`-driven CMD (Cloud Run injects `PORT`).
- **Do not** `COPY . .` without a `.dockerignore` (`.venv/`, `.git/`, `.env`, credentials, caches) — three of four projects leak these into images.
- Use a **non-root user** (`USER` directive) — none of the four do; do it for new services.
- Consider a multi-stage build when the dependency tree is large.
- Add a Docker `HEALTHCHECK` hitting `/health`.
- Dev-only: docker compose with the Firestore emulator, credential mounts `:ro`, and Compose Watch sync (cognito-chat-api, identity-service) — this is the local dev loop. The same `firestore` service is the test infrastructure: `make test` boots it, runs pytest, tears it down (cognito-chat-api `Makefile` is the reference). Prefer a compose service over `docker run` so the emulator config lives in one place.

## Deployment

- Target: **Google Cloud Run**. Multi-container sidecar topologies (gateway + sidecars, port per container, `run.googleapis.com/container-dependencies`) are the platform pattern (atlas `deployment/cloudrun-service.yaml`).
- Credentials: Application Default Credentials on Cloud Run; service-account JSON only locally, mounted read-only.
- Secrets: Google Secret Manager, injected as env vars at deploy time (atlas `ATLAS_CONFIG` bundle via the runtime entrypoint). Never bake secrets into images.
- `PORT` env var decides the listening port; default `8001` locally, `8080` on Cloud Run.
- Keep a `service-manifest.yaml`-style GitOps manifest (service → repo, branch, version, secret) as the deploy source of truth (atlas).

## CI/CD

- GitHub Actions. Two workflows at minimum:
  - **Lint** on push/PR to `main`: setup-python 3.12, `pip install ruff`, `ruff check .`, `ruff format --check .` (keysentry-api, atlas).
  - **Test**: same setup + Firestore emulator service + pytest.
- Type-check (pyright) in CI where the repo has `pyrightconfig.json`.
- Pre-commit with local hooks calling `make lint` and tests (keysentry-api, atlas).
- Deploy via `gcloud run services replace` with `envsubst`-templated manifests (atlas `sidecar-ci.yml`); matrix builds with `fail-fast: false` so one service doesn't block others.

## Security

Mandatory defaults:

- CORS: explicit `allow_origins` for the real frontend origins; **never `allow_origins=["*"]` with `allow_credentials=True`** — invalid per the CORS spec and present in all four analyzed projects. Fix it in every service you touch.
- Constant-time comparisons (`hmac.compare_digest`) for all secrets/API keys.
- Ownership checks on every resource access (prevent IDOR).
- JWT verification always enforces issuer and audience; reject `type == "refresh"` tokens at access verification.
- Argon2id for passwords; hashed storage for secrets and opaque tokens.
- Rate limiting and bot protection (Cloudflare Turnstile, identity-service) on user-facing auth endpoints.
- Security headers middleware: HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (identity-service `SecurityHeadersMiddleware`) — replicate on every public service.
- Validation at the boundary (schemas) prevents injection; never interpolate user input into Firestore field paths or commands.
- Secrets only via env/Secret Manager; `.env` and credential files gitignored; no insecure defaults that silently pass in production.

## Documentation

- `README.md`: purpose, quickstart (`make install`, `make dev`), env vars summary, deploy notes.
- `docs/` for architecture decisions: request flows, datastore collections, token semantics, error catalog (identity-service `docs/reference.md` is the exemplar with an error-code table and collection list).
- Keep docs in sync with code — every project analyzed has stale docs (removed env vars, removed endpoints, orphaned alembic). When you change a contract, update the docs in the same change.
- Keep a Postman collection if API testing is manual; delete duplicates and broken references (cognito-chat-api has a nested `postman/postman` duplicate and a dangling `.postman/resources.yaml`).

## MUST Rules

1. Use FastAPI with async handlers, Pydantic v2 schemas, and `response_model` on data endpoints.
2. Use the layered flow: router → service → repository → datastore. No business logic in routers or repositories.
3. Use pydantic-settings `Settings` with `env_file=".env"` and `extra="ignore"`; every env var typed with a default; `.env.example` committed and in sync.
4. Never hardcode secrets; never commit `.env` or credential files; no insecure defaults in production.
5. Verify JWT issuer and audience on every token; constant-time comparisons for secrets; ownership checks on every resource.
6. Never `allow_origins=["*"]` with `allow_credentials=True`.
7. Use `logging.getLogger(__name__)`, lazy `%s` formatting, and never log secrets, tokens, passwords, or full request/response bodies of auth endpoints.
8. Never `except Exception: pass`; log unexpected failures and return a generic 5xx without internals.
9. Repository methods return Pydantic `*DB` models; serialize with `model_dump(mode="json")`; use transactions + retry for read-modify-write invariants.
10. Use `hmac.compare_digest`-grade secret comparison and `asyncio.to_thread` for sync SDK calls.
11. Tests run against the Firestore emulator with a DB wipe between tests; CI runs lint + tests.
12. Pin dependencies in `requirements.txt`; keep dev dependencies out of the runtime image.
13. Use lifespan, not `@app.on_event`; close clients on shutdown.
14. Dockerfile: `python:3.12-slim`, `PORT`-driven uvicorn CMD, `.dockerignore` present, non-root user, `HEALTHCHECK`.
15. Keep tests in sync with the API surface; never mask test failures in CI (`|| true`).

## SHOULD Rules

1. Centralize error taxonomy in `app/core/errors.py` with stable machine-readable codes and a catch-all 500 handler in `main.py`.
2. Version the API with `/api/v1` from `settings.API_V1_STR`.
3. Paginate with `limit`/`offset` and a generic `PaginatedResponse[T]`; cap `limit`.
4. Store shared runtime objects on `app.state`; expose via `Depends`.
5. Add a request-logging middleware (method, path, status, duration).
6. Add security headers middleware (HSTS, nosniff, frame-deny).
7. Provision the Firestore emulator as a `docker-compose.yml` service and run Firebase for real against it — no `firebase_admin` mocks; `httpx.ASGITransport` + `asgi_lifespan.LifespanManager` as the app client.
8. Keep integrations behind interfaces with stable error types; shared `httpx.AsyncClient` with tuned timeouts.
9. Make Redis caching optional and fail-open; central cache-key builder; explicit invalidation on writes.
10. Use GitHub Actions with separate lint and test workflows; pre-commit with local `make` hooks.
11. Use a Makefile with `install`, `dev`, `lint`, `format`, `test`, `clean` targets using `.venv/bin/*`.
12. Configure ruff with `line-length = 120` and the standard FastAPI ignore list (B008, DTZ003, BLE001, TRY201) with comments.
13. Provide `pyrightconfig.json` (`venvPath: "."`, `typeCheckingMode: "basic"`) and run pyright in CI.
14. Write `docs/` reference material (endpoints, collections, error codes) and update it with the code.

## MAY Rules

1. `src/` layout instead of `app/` — pick one, stay consistent.
2. Uppercase settings fields with `case_sensitive=True`.
3. Dataclasses for provider-internal value types.
4. `TestClient` (sync) instead of ASGITransport when lifespan coverage is unnecessary.
5. Event bus / background asyncio tasks for in-process decoupling when a managed worker (Trigger.dev) is overkill.
6. In-memory pagination/filtering when Firestore query capabilities are insufficient — document the tradeoff.
7. Legacy PostgreSQL + Alembic only where a relational schema already exists and is required.

## AVOID Rules

1. Synchronous I/O on the event loop; blocking SDK calls without `asyncio.to_thread`.
2. Raising `HTTPException` from repositories, services (except at the boundary where a domain error maps to it), or integration clients.
3. Importing inside function bodies to dodge circular imports — fix the module graph instead.
4. Hand-rolled, copy-pasted cache blocks per router — extract a shared helper.
5. Python-side filtering over full datastore streams without a documented reason.
6. Mixing pagination styles, response casing (snake vs camel), or error envelope shapes within one API.
7. Global `settings` mutation in tests; manual `firebase_admin` mocking when the Firestore emulator is available; dead endpoints still covered by tests; `print()` in application code.
8. `@app.on_event`; `datetime.utcnow()`; naive datetimes; `os.getenv` scattered outside `Settings`.
9. Logging request/response bodies (secret leakage), and embedding `exc` objects or internal hostnames in client-facing `detail`.
10. Adding dependencies without justification; keeping dead dependencies; unpinned requirements in new projects.
11. `.dockerignore`-less Dockerfiles; running as root when not required; dev tools in runtime images.
12. Stale `.env.example`/docs/READMEs — update them in the same change as the code.

## Common Anti-Patterns Observed in the Source Projects

| Anti-pattern                                                  | Where                                                          | Consequence                                                                                    |
| ------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| CORS `*` + credentials                                        | all four projects                                              | Browsers reject/allow credentialed cross-origin calls unsafely                                 |
| Insecure default secrets                                      | keysentry, cognito, identity, atlas                            | Deployable with known credentials if env missing                                               |
| Unverified JWT audience                                       | cognito-chat-api `dependencies.py`                             | Tokens minted for other services are accepted                                                  |
| Missing ownership checks (IDOR)                               | keysentry-api `routers/api_keys.py`                            | Any user can modify another user's resources                                                   |
| `HTTPException` in repositories                               | cognito-chat-api `repositories/config.py`                      | HTTP concerns leak into data access                                                            |
| Non-constant-time secret comparison                           | atlas `security.py`, keysentry inline                          | Timing side channel on the auth boundary                                                       |
| Orphaned infrastructure after migration                       | keysentry alembic (imports removed `Base`), dead celery worker | Broken Makefile targets, confusing repo                                                        |
| Dead code + tests for removed endpoints                       | cognito-chat-api auth stack                                    | Suite cannot pass; false sense of coverage                                                     |
| Dev deps in prod images                                       | all four (mixed requirements)                                  | Larger images, more attack surface                                                             |
| `print()` logging                                             | cognito, keysentry, identity                                   | Unstructured, unroutable logs                                                                  |
| Logging full bodies at error                                  | atlas `proxy.py`                                               | Secrets in log streams                                                                         |
| `                                                             |                                                                | true` on test target                                                                           | keysentry Makefile | CI passes while tests fail |
| Module-level side effects at import                           | keysentry `register_events()`, atlas http_client               | Hard-to-test, order-dependent behavior                                                         |
| Manual `firebase_admin` mocks while the emulator is available | cognito-chat-api `tests/conftest.py`                           | Masks real init behavior; drifts from production and from identity-service's mock-free pattern |

## Resolved Conflicts

| Concern            | cognito-chat-api      | keysentry-api         | identity-service       | project-atlas   | Resolution                                        |
| ------------------ | --------------------- | --------------------- | ---------------------- | --------------- | ------------------------------------------------- |
| Deps               | unpinned requirements | pinned                | pinned                 | pinned          | Pin with `==`                                     |
| Layout             | `app/`                | `src/`                | `app/`                 | `gateway/`      | `app/` (majority; `src/` acceptable)              |
| Routers dir        | `router/`             | `routers/`            | `routers/`             | `api/routes/`   | `routers/`                                        |
| API versioning     | none                  | `/api/v1`             | `/api/v1` (mostly)     | passthrough     | `/api/v1` prefix                                  |
| Settings casing    | lowercase             | UPPERCASE             | lowercase              | UPPERCASE       | lowercase                                         |
| Test client        | sync TestClient       | ASGITransport         | ASGITransport+Lifespan | none            | ASGITransport + LifespanManager                   |
| Exception handlers | none                  | 3 handlers            | domain + catch-all     | none            | domain errors + catch-all + 422                   |
| Request logging    | none                  | middleware            | none                   | none            | middleware                                        |
| Python version     | 3.12 image            | 3.12                  | 3.12                   | 3.11/3.12 drift | 3.12 everywhere                                   |
| Error envelope     | mixed `detail`/codes  | `detail`              | RFC 6749 + `detail`    | passthrough     | stable per-service shape, codes for domain errors |
| Secret comparison  | —                     | inline `!=`           | `==`                   | `!=`            | `hmac.compare_digest`                             |
| DB                 | Firestore             | Firestore (migrating) | Firestore              | none            | Firestore                                         |

## Reference Architecture

```text
project/
├── app/
│   ├── __init__.py
│   ├── main.py                 # app, lifespan, middleware, handlers, /health
│   ├── dependencies.py         # get_db, get_x_service, auth dependencies
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Settings (pydantic-settings)
│   │   ├── database.py         # Firebase init, AsyncClient, get_db
│   │   ├── security.py         # token verification, get_current_user
│   │   ├── errors.py           # domain exceptions + stable codes
│   │   ├── logger.py           # logger setup + RequestLoggingMiddleware
│   │   └── cache.py            # optional fail-open Redis cache
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py           # GET /health
│   │   ├── auth.py             # /api/v1/auth/...
│   │   └── <domain>.py         # per-domain routers
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── <domain>.py         # *Create / *Update / *Response
│   ├── models/
│   │   ├── __init__.py
│   │   └── <domain>.py         # *DB document models
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py             # BaseRepository (get/create/update/delete)
│   │   └── <domain>.py         # per-collection repositories
│   ├── services/
│   │   ├── __init__.py
│   │   └── <domain>.py         # business logic
│   ├── integrations/
│   │   ├── __init__.py
│   │   ├── base.py             # interface + error taxonomy
│   │   └── <provider>.py       # SDK-confined implementation
│   └── utils/
│       └── datetime.py         # pure helpers only
├── tests/
│   ├── conftest.py             # emulator env, wipe fixture, app client, auth bypass
│   ├── api/                    # endpoint tests
│   └── unit/                   # service/repository tests
├── scripts/                    # idempotent migrations, seeding
├── docs/
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile
├── Makefile
├── pyproject.toml              # [tool.ruff], [tool.pytest.ini_options]
├── pyrightconfig.json
├── requirements.txt            # pinned direct runtime deps
└── requirements-dev.txt        # pytest, pytest-asyncio, ruff, httpx
```

## New Project Checklist

- [ ] `app/` package layout with `__init__.py` everywhere; `core/`, `routers/`, `schemas/`, `models/`, `repositories/`, `services/`, `integrations/` present
- [ ] `main.py`: FastAPI app with lifespan (init DB, shared client on `app.state`, close on shutdown), health endpoint, exception handlers, CORS with explicit origins, security headers
- [ ] `core/config.py`: pydantic-settings `Settings`, lowercase fields, `extra="ignore"`, `env_file=".env"`; `.env.example` committed and matching
- [ ] `core/errors.py`: domain exception hierarchy with stable codes
- [ ] `core/logger.py`: named loggers + request-logging middleware
- [ ] `core/database.py`: Firebase init + async Firestore client + `get_db` dependency
- [ ] `core/security.py`: bearer-token verification enforcing issuer + audience; `hmac.compare_digest` for secrets
- [ ] Repositories: one per collection, Pydantic `*DB` in/out, `model_dump(mode="json")`, transactions for invariants
- [ ] Services: business logic only; no HTTPException from repositories
- [ ] Endpoints: `/api/v1` prefix, `response_model`, ownership checks, `limit`/`offset` pagination
- [ ] Auth dependency (`get_current_user`) on every protected route; ownership verification on every resource
- [ ] Tests: `firestore` emulator service in `docker-compose.yml`, emulator-based conftest with no `firebase_admin` mocks, per-test DB wipe, app client via ASGITransport + LifespanManager, auth bypass, unit tests for the hard logic
- [ ] `requirements.txt` pinned direct deps; `requirements-dev.txt` separated
- [ ] Dockerfile: `python:3.12-slim`, `.dockerignore`, non-root user, `HEALTHCHECK`, `PORT`-driven CMD
- [ ] Makefile: `install`, `dev`, `lint`, `format`, `test`, `clean` (no `|| true`)
- [ ] GitHub Actions: lint (ruff) + test (emulator) on push/PR; pyright in CI
- [ ] `pyproject.toml` tool config: ruff (`line-length = 120` + documented ignores), pytest settings
- [ ] `pyrightconfig.json` present; code type-checks at `basic`
- [ ] README with quickstart; `docs/` with endpoints, collections, error codes
- [ ] No secrets in code, config defaults, logs, or images; `.env`/credentials gitignored
