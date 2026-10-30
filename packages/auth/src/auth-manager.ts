export type AuthEventListener = (
  event: "login" | "logout" | "refresh",
  data?: unknown,
) => void;

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface AuthSession {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    accessToken?: string;
    refreshToken?: string;
  };
}

export type RefreshTokenHandler = () => Promise<TokenPair | null>;
export type SessionResolver = () => Promise<AuthSession | null>;
export type TokenSyncHandler = (tokens: {
  accessToken: string;
  refreshToken?: string;
}) => Promise<void> | void;

export interface RequestHeaderConfig {
  headers?:
    | Record<string, string>
    | {
        set?: (key: string, value: string) => void;
        [key: string]: unknown;
      };
}

type CachedSession = {
  session: AuthSession | null;
  expiresAt: number;
};

const BROWSER_SESSION_CACHE_TTL_MS = 60_000;
const EMPTY_BROWSER_SESSION_CACHE_TTL_MS = 10_000;

/**
 * Singleton AuthManager coordinating token refreshes, preventing duplicate in-flight requests,
 * managing session caching, and broadcasting auth lifecycle events.
 */
export class AuthManager {
  private static instance: AuthManager;
  private tokens: TokenPair | null = null;
  private refreshPromise: Promise<TokenPair | null> | null = null;
  private refreshHandler: RefreshTokenHandler | null = null;
  private sessionResolver: SessionResolver | null = null;
  private tokenSyncHandler: TokenSyncHandler | null = null;
  private listeners: Set<AuthEventListener> = new Set();
  private browserSessionCache: CachedSession | null = null;
  private browserSessionPromise: Promise<AuthSession | null> | null = null;

  public constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public setRefreshHandler(handler: RefreshTokenHandler): void {
    this.refreshHandler = handler;
  }

  public setSessionResolver(resolver: SessionResolver): void {
    this.sessionResolver = resolver;
  }

  public setTokenSyncHandler(handler: TokenSyncHandler): void {
    this.tokenSyncHandler = handler;
  }

  public setTokens(tokens: TokenPair | null): void {
    this.tokens = tokens;
    if (tokens) {
      this.browserSessionCache = {
        session: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        expiresAt: Date.now() + BROWSER_SESSION_CACHE_TTL_MS,
      };
      this.emit("login", tokens);
    } else {
      this.browserSessionCache = null;
      this.emit("logout");
    }
  }

  public getTokens(): TokenPair | null {
    return this.tokens;
  }

  public getAccessToken(): string | null {
    return (
      this.tokens?.accessToken ||
      this.browserSessionCache?.session?.accessToken ||
      this.browserSessionCache?.session?.user?.accessToken ||
      null
    );
  }

  public clearBrowserSessionCache(): void {
    this.browserSessionCache = null;
    this.browserSessionPromise = null;
  }

  /**
   * Pre-seeds in-memory session cache from layout/server session to eliminate initial blocking fetch.
   */
  public seedSession(session: AuthSession | null): void {
    if (!session) return;
    const accessToken = session.accessToken || session.user?.accessToken;
    const refreshToken = session.refreshToken || session.user?.refreshToken;

    if (accessToken) {
      this.tokens = {
        accessToken,
        refreshToken,
      };
    }

    this.browserSessionCache = {
      session,
      expiresAt: Date.now() + BROWSER_SESSION_CACHE_TTL_MS,
    };
  }

  /**
   * Updates cached tokens in-memory and triggers background token sync hook.
   */
  public async updateTokens(
    newAccessToken: string,
    newRefreshToken?: string,
  ): Promise<void> {
    if (!newAccessToken) return;

    const current = this.browserSessionCache?.session;
    const existingAccessToken =
      current?.accessToken ||
      current?.user?.accessToken ||
      this.tokens?.accessToken;

    if (
      newAccessToken === existingAccessToken &&
      (!newRefreshToken ||
        newRefreshToken ===
          (current?.refreshToken ||
            current?.user?.refreshToken ||
            this.tokens?.refreshToken))
    ) {
      return;
    }

    this.tokens = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken || this.tokens?.refreshToken,
    };

    const updatedSession: AuthSession = {
      ...current,
      accessToken: newAccessToken,
      refreshToken:
        newRefreshToken || current?.refreshToken || this.tokens?.refreshToken,
      user: current?.user
        ? {
            ...current.user,
            accessToken: newAccessToken,
            refreshToken:
              newRefreshToken ||
              current.user.refreshToken ||
              this.tokens?.refreshToken,
          }
        : undefined,
    };

    this.browserSessionCache = {
      session: updatedSession,
      expiresAt: Date.now() + BROWSER_SESSION_CACHE_TTL_MS,
    };

    this.emit("refresh", this.tokens);

    if (this.tokenSyncHandler) {
      try {
        await this.tokenSyncHandler({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      } catch {
        // Suppress background sync errors
      }
    }
  }

  public async getAuthSession(): Promise<AuthSession | null> {
    const now = Date.now();
    if (this.browserSessionCache && this.browserSessionCache.expiresAt > now) {
      return this.browserSessionCache.session;
    }

    if (this.sessionResolver) {
      if (this.browserSessionPromise) {
        return this.browserSessionPromise;
      }

      this.browserSessionPromise = (async () => {
        try {
          const session = await this.sessionResolver!();
          this.browserSessionCache = {
            session,
            expiresAt:
              Date.now() +
              (session
                ? BROWSER_SESSION_CACHE_TTL_MS
                : EMPTY_BROWSER_SESSION_CACHE_TTL_MS),
          };
          if (session?.accessToken || session?.user?.accessToken) {
            this.tokens = {
              accessToken:
                session.accessToken || session.user?.accessToken || "",
              refreshToken: session.refreshToken || session.user?.refreshToken,
            };
          }
          return session;
        } finally {
          this.browserSessionPromise = null;
        }
      })();

      return this.browserSessionPromise;
    }

    if (this.tokens) {
      return {
        accessToken: this.tokens.accessToken,
        refreshToken: this.tokens.refreshToken,
      };
    }

    return null;
  }

  /**
   * Applies the Bearer token and X-Refresh-Token to outgoing HTTP request configs (Axios or fetch).
   */
  public async applyAuthTokenToReq(config: RequestHeaderConfig): Promise<void> {
    const session = await this.getAuthSession();
    const tokenPair = this.getTokens();

    const accessToken =
      session?.accessToken ||
      session?.user?.accessToken ||
      tokenPair?.accessToken;
    const refreshToken =
      session?.refreshToken ||
      session?.user?.refreshToken ||
      tokenPair?.refreshToken;

    if (!config.headers) {
      config.headers = {};
    }

    if (accessToken) {
      if (
        typeof (config.headers as Record<string, unknown>).set === "function"
      ) {
        (
          (config.headers as Record<string, unknown>).set as (
            k: string,
            v: string,
          ) => void
        )("Authorization", `Bearer ${accessToken}`);
      } else {
        (config.headers as Record<string, string>)["Authorization"] =
          `Bearer ${accessToken}`;
      }
    }

    if (refreshToken) {
      if (
        typeof (config.headers as Record<string, unknown>).set === "function"
      ) {
        (
          (config.headers as Record<string, unknown>).set as (
            k: string,
            v: string,
          ) => void
        )("X-Refresh-Token", refreshToken);
      } else {
        (config.headers as Record<string, string>)["X-Refresh-Token"] =
          refreshToken;
      }
    }
  }

  public async refreshToken(): Promise<TokenPair | null> {
    if (!this.refreshHandler) {
      return null;
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const newTokens = await this.refreshHandler!();
        this.tokens = newTokens;
        if (newTokens) {
          this.browserSessionCache = {
            session: {
              accessToken: newTokens.accessToken,
              refreshToken: newTokens.refreshToken,
            },
            expiresAt: Date.now() + BROWSER_SESSION_CACHE_TTL_MS,
          };
          this.emit("refresh", newTokens);
        } else {
          this.browserSessionCache = null;
          this.emit("logout");
        }
        return newTokens;
      } catch (error) {
        this.tokens = null;
        this.browserSessionCache = null;
        this.emit("logout");
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  public subscribe(listener: AuthEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: "login" | "logout" | "refresh", data?: unknown): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch {
        // Suppress listener error
      }
    });
  }

  public clear(): void {
    this.tokens = null;
    this.refreshPromise = null;
    this.browserSessionCache = null;
    this.browserSessionPromise = null;
    this.emit("logout");
  }
}

export const authManager = AuthManager.getInstance();
