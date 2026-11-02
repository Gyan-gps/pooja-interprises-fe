"use client";

export class ApiRequestError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options: { statusCode: number; code: string; details?: unknown }
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

interface ApiSuccessBody<T> {
  success: true;
  data: T;
}

interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

type ApiBody<T> = ApiSuccessBody<T> | ApiErrorBody;

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const nextPath = `${window.location.pathname}${window.location.search}`;
  const loginUrl = nextPath && nextPath !== "/login"
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";
  window.location.assign(loginUrl);
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "same-origin",
  });

  if (response.status === 401) {
    redirectToLogin();
    throw new ApiRequestError("Authentication required.", {
      statusCode: 401,
      code: "UNAUTHENTICATED",
    });
  }

  let payload: ApiBody<T> | null = null;
  try {
    payload = (await response.json()) as ApiBody<T>;
  } catch {
    throw new ApiRequestError("Invalid server response.", {
      statusCode: response.status,
      code: "INVALID_RESPONSE",
    });
  }

  if (!response.ok || !payload.success) {
    const errorBody = payload && !payload.success ? payload.error : null;
    throw new ApiRequestError(
      errorBody?.message || "Request failed.",
      {
        statusCode: response.status,
        code: errorBody?.code || "REQUEST_FAILED",
        details: errorBody?.details,
      }
    );
  }

  return payload.data;
}

export function toQueryString(
  params: Record<string, string | number | undefined | null>
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
