export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export type QueryValue = string | number | boolean | null | undefined;

const DEFAULT_PROXY_BASE = "/api/hive";
const DEFAULT_BACKEND_HTTP_BASE = "http://localhost:8000";
type DummyApiCache = {
  GET?: Record<string, unknown>;
  POST?: Record<string, unknown>;
};

let dummy_api_data: DummyApiCache | null = null;

export function isDummyEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";
}

function getProxyBase(): string {
  const configured = process.env.NEXT_PUBLIC_HIVE_PROXY_PREFIX ?? DEFAULT_PROXY_BASE;
  const withLeadingSlash = configured.startsWith("/") ? configured : `/${configured}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function getBackendHttpBase(): string {
  const configured =
    process.env.NEXT_PUBLIC_HIVE_BACKEND_URL ??
    process.env.HIVE_BACKEND_URL ??
    DEFAULT_BACKEND_HTTP_BASE;
  return configured.replace(/\/+$/, "");
}

function normalizePath(path: string): string {
  if (!path) {
    return "";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

async function loadDummyApiData(): Promise<DummyApiCache> {
  if (dummy_api_data) {
    return dummy_api_data;
  }

  const response = await fetch("/dummy_api_data.json", { cache: "force-cache" });
  if (!response.ok) {
    throw new ApiError("Failed to load dummy API cache", response.status, await parseResponseBody(response));
  }

  dummy_api_data = (await response.json()) as DummyApiCache;
  return dummy_api_data;
}

function matchTemplatePath(path: string, template: string): boolean {
  if (template.endsWith("/*")) {
    return path.startsWith(template.slice(0, -1));
  }

  const pathSegments = path.split("/").filter(Boolean);
  const templateSegments = template.split("/").filter(Boolean);
  if (pathSegments.length !== templateSegments.length) {
    return false;
  }

  return templateSegments.every((segment, idx) => segment.startsWith(":") || segment === pathSegments[idx]);
}

function findDummyPayload(cache: DummyApiCache, method: string, path: string): unknown | undefined {
  const map = cache[method as keyof DummyApiCache] ?? {};
  if (Object.prototype.hasOwnProperty.call(map, path)) {
    return map[path];
  }

  const pathWithoutQuery = path.split("?")[0];
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

async function getDummyResponse<T>(method: string, path: string): Promise<T> {
  const cache = await loadDummyApiData();
  const payload = findDummyPayload(cache, method, path);
  if (payload === undefined) {
    throw new ApiError(`Dummy cache miss for ${method} ${path}`, 404, { method, path });
  }
  return payload as T;
}

export function withQuery(path: string, query?: Record<string, QueryValue>): string {
  if (!query) {
    return path;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }
    params.set(key, String(value));
  }

  const queryString = params.toString();
  if (!queryString) {
    return path;
  }

  return `${path}${path.includes("?") ? "&" : "?"}${queryString}`;
}

export function buildBackendWebSocketUrl(path: string): string {
  const wsBase = process.env.NEXT_PUBLIC_HIVE_WS_BASE?.replace(/\/+$/, "");
  if (wsBase) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${wsBase}${normalizedPath}`;
  }

  const httpBase = getBackendHttpBase();
  const wsProtocol = httpBase.startsWith("https://") ? "wss://" : "ws://";
  const host = httpBase.replace(/^https?:\/\//, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${wsProtocol}${host}${normalizedPath}`;
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

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await parseResponseBody(response);
    throw new ApiError(`Request failed with status ${response.status}`, response.status, details);
  }

  return (await parseResponseBody(response)) as T;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = normalizePath(path);
  if (isDummyEnabled()) {
    return getDummyResponse<T>("GET", normalizedPath);
  }
  const url = `${getProxyBase()}${normalizedPath}`;
  return requestJson<T>(url, {
    method: "GET",
    ...init,
  });
}

export async function apiPost<TBody, TResponse>(path: string, body: TBody, init?: RequestInit): Promise<TResponse> {
  const normalizedPath = normalizePath(path);
  if (isDummyEnabled()) {
    return getDummyResponse<TResponse>("POST", normalizedPath);
  }
  const url = `${getProxyBase()}${normalizedPath}`;
  return requestJson<TResponse>(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
    ...init,
  });
}
