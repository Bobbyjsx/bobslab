type AuthEventListener = (event: "login" | "logout" | "refresh", data?: unknown) => void;

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export type RefreshTokenHandler = () => Promise<TokenPair | null>;

/**
 * Singleton AuthManager coordinating token refreshes, preventing duplicate in-flight requests,
 * and broadcasting auth lifecycle events.
 */
export class AuthManager {
  private static instance: AuthManager;
  private tokens: TokenPair | null = null;
  private refreshPromise: Promise<TokenPair | null> | null = null;
  private refreshHandler: RefreshTokenHandler | null = null;
  private listeners: Set<AuthEventListener> = new Set();

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public setRefreshHandler(handler: RefreshTokenHandler): void {
    this.refreshHandler = handler;
  }

  public setTokens(tokens: TokenPair | null): void {
    this.tokens = tokens;
    if (tokens) {
      this.emit("login", tokens);
    } else {
      this.emit("logout");
    }
  }

  public getTokens(): TokenPair | null {
    return this.tokens;
  }

  public getAccessToken(): string | null {
    return this.tokens?.accessToken ?? null;
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
          this.emit("refresh", newTokens);
        } else {
          this.emit("logout");
        }
        return newTokens;
      } catch (error) {
        this.tokens = null;
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
    this.emit("logout");
  }
}

export const authManager = AuthManager.getInstance();
