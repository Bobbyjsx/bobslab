export const FALLBACK_AUTH_ERROR = "An error occurred during authentication";

export enum ApiErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  OTP_EXPIRED = "OTP_EXPIRED",
  OTP_ATTEMPTS_EXCEEDED = "OTP_ATTEMPTS_EXCEEDED",
  USER_NOT_FOUND = "USER_NOT_FOUND",
}

export type ServerActionError = {
  isServerActionError: true;
  message: string;
  statusCode?: number;
  detail?: string | Array<{ loc?: string[]; msg?: string }>;
};

export function isServerError(
  error: unknown,
): error is { error: string; isServerActionError: true } {
  return (
    typeof error === "object" &&
    error !== null &&
    "isServerActionError" in error &&
    (error as { isServerActionError?: boolean }).isServerActionError === true
  );
}

export function transformServerErrorToString(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosLike = error as {
      message?: string;
      response?: { status?: number; data?: { detail?: unknown; message?: unknown } };
    };
    const detail =
      axiosLike.response?.data?.detail ?? axiosLike.response?.data?.message;

    return JSON.stringify({
      message: axiosLike.message ?? FALLBACK_AUTH_ERROR,
      statusCode: axiosLike.response?.status,
      detail,
    });
  }

  if (error instanceof Error) {
    return JSON.stringify({
      message: error.message,
    });
  }

  if (typeof error === "string") {
    return JSON.stringify({
      message: error,
    });
  }

  return JSON.stringify({
    message: FALLBACK_AUTH_ERROR,
  });
}

export function parseServerActionError(error: unknown): unknown {
  if (isServerError(error)) {
    try {
      return JSON.parse(error.error);
    } catch {
      return { message: FALLBACK_AUTH_ERROR };
    }
  }
  return error;
}

export function getErrorMessage(
  error: unknown,
  fallback = FALLBACK_AUTH_ERROR,
): string {
  if (error && typeof error === "object") {
    // Axios response check
    const anyErr = error as any;
    const detail = anyErr.response?.data?.detail ?? anyErr.response?.data?.message;
    if (typeof detail === "string") return detail;

    // Check parsed server error
    const parsed = parseServerActionError(error) as any;
    if (parsed && typeof parsed.detail === "string") {
      return parsed.detail;
    }
    if (parsed && typeof parsed.message === "string") {
      return parsed.message;
    }

    if (error instanceof Error) {
      return error.message;
    }
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
}
