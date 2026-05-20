import "server-only";

import { readFile } from "fs/promises";
import path from "path";

import { ApiError, QueryValue, withQuery } from "@/lib/api/http";

const DEFAULT_BACKEND_URL = "http://localhost:8000";

type DummyApiCache = {
  GET?: Record<string, unknown>;
  POST?: Record<string, unknown>;
};

let dummy_api_data: DummyApiCache | null = null;

function isDummyEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true" || process.env.USE_DUMMY_DATA === "true";
}

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

async function loadDummyApiData(): Promise<DummyApiCache> {
  if (dummy_api_data) {
    return dummy_api_data;
  }

  const filePath = path.join(process.cwd(), "public", "dummy_api_data.json");
  const raw = await readFile(filePath, "utf8");
  dummy_api_data = JSON.parse(raw) as DummyApiCache;
  return dummy_api_data;
}

function matchTemplatePath(pathname: string, template: string): boolean {
  if (template.endsWith("/*")) {
    return pathname.startsWith(template.slice(0, -1));
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  const templateSegments = template.split("/").filter(Boolean);
  if (pathSegments.length !== templateSegments.length) {
    return false;
  }

  return templateSegments.every((segment, idx) => segment.startsWith(":") || segment === pathSegments[idx]);
}

function findDummyPayload(cache: DummyApiCache, method: string, pathValue: string): unknown | undefined {
  const map = cache[method as keyof DummyApiCache] ?? {};
  if (Object.prototype.hasOwnProperty.call(map, pathValue)) {
    return map[pathValue];
  }

  const pathWithoutQuery = pathValue.split("?")[0];
  if (pathWithoutQuery && Object.prototype.hasOwnProperty.call(map, pathWithoutQuery)) {
    return map[pathWithoutQuery];
  }

  for (const [template, payload] of Object.entries(map)) {
    if (template.includes(":") || template.endsWith("/*")) {
      if (matchTemplatePath(pathWithoutQuery, template)) {
        return payload;
      }
    }
  }

  return undefined;
}

async function getDummyResponse<T>(method: string, pathValue: string): Promise<T> {
  const cache = await loadDummyApiData();
  const payload = findDummyPayload(cache, method, pathValue);
  if (payload === undefined) {
    throw new ApiError(`Dummy cache miss for ${method} ${pathValue}`, 404, { method, path: pathValue });
  }
  return payload as T;
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
  if (isDummyEnabled()) {
    const pathValue = withQuery(normalizePath(path), options?.query);
    return getDummyResponse<T>("GET", pathValue);
  }
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
  if (isDummyEnabled()) {
    const pathValue = withQuery(normalizePath(path), options?.query);
    return getDummyResponse<TResponse>("POST", pathValue);
  }
  return requestBackendJson<TResponse>("POST", path, {
    ...options,
    body,
  });
}
