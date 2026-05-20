import "server-only";

import { ApiError, QueryValue, withQuery } from "@/lib/api/http";

const DEFAULT_BACKEND_URL = "http://localhost:8000";

type NextFetchHints = {
  revalidate?: number | false;
  tags?: string[];
};

type ServerRequestInit = RequestInit & {
  next?: NextFetchHints;
};

function getBackendBaseUrl(): string {
  const raw =
    process.env.HIVE_BACKEND_URL ??
    process.env.NEXT_PUBLIC_HIVE_BACKEND_URL ??
    DEFAULT_BACKEND_URL;
  return raw.replace(/\/+$/, "");
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildApiUrl(path: string, query?: Record<string, QueryValue>): string {
  return `${getBackendBaseUrl()}/api${withQuery(normalizePath(path), query)}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function requestBackendJson<T>(
  method: string,
  path: string,
  options?: {
    query?: Record<string, QueryValue>;
    body?: unknown;
    init?: ServerRequestInit;
  },
): Promise<T> {
  const response = await fetch(buildApiUrl(path, options?.query), {
    method,
    cache: "no-store",
    ...options?.init,
    headers: {
      "content-type": "application/json",
      ...(options?.init?.headers ?? {}),
    },
    body: options?.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const details = await parseResponseBody(response);
    throw new ApiError(`Backend request failed with status ${response.status}`, response.status, details);
  }

  return (await parseResponseBody(response)) as T;
}

export async function serverGet<T>(
  path: string,
  options?: {
    query?: Record<string, QueryValue>;
    init?: ServerRequestInit;
  },
): Promise<T> {
  return requestBackendJson<T>("GET", path, options);
}

export async function serverPost<TBody, TResponse>(
  path: string,
  body: TBody,
  options?: {
    query?: Record<string, QueryValue>;
    init?: ServerRequestInit;
  },
): Promise<TResponse> {
  return requestBackendJson<TResponse>("POST", path, {
    ...options,
    body,
  });
}
