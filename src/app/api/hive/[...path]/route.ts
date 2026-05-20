import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_URL = "http://localhost:8000";

type RouteContext = {
  params: Promise<{ path?: string[] }> | { path?: string[] };
};

function getBackendBaseUrl(): string {
  const raw =
    process.env.HIVE_BACKEND_URL ??
    process.env.NEXT_PUBLIC_HIVE_BACKEND_URL ??
    DEFAULT_BACKEND_URL;
  return raw.replace(/\/+$/, "");
}

async function getPathSegments(context: RouteContext): Promise<string[]> {
  const params = await context.params;
  return Array.isArray(params.path) ? params.path : [];
}

function buildTargetUrl(request: NextRequest, pathSegments: string[]): string {
  const encodedPath = pathSegments.map((segment) => encodeURIComponent(segment)).join("/");
  const targetPath = encodedPath ? `/api/${encodedPath}` : "/api";
  return `${getBackendBaseUrl()}${targetPath}${request.nextUrl.search}`;
}

function buildForwardHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  const passThrough = ["accept", "content-type", "authorization", "x-request-id"];

  for (const key of passThrough) {
    const value = request.headers.get(key);
    if (value) {
      headers.set(key, value);
    }
  }

  return headers;
}

async function proxy(request: NextRequest, context: RouteContext, method: string): Promise<NextResponse> {
  const pathSegments = await getPathSegments(context);
  const targetUrl = buildTargetUrl(request, pathSegments);

  try {
    const hasBody = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
    const body = hasBody ? await request.arrayBuffer() : undefined;

    const upstream = await fetch(targetUrl, {
      method,
      headers: buildForwardHeaders(request),
      body,
      cache: "no-store",
      redirect: "follow",
    });

    const responseHeaders = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown proxy error";
    return NextResponse.json(
      {
        error: "Backend request failed",
        target: targetUrl,
        detail: message,
      },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context, "GET");
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context, "POST");
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context, "PUT");
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context, "PATCH");
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context, "DELETE");
}

export async function OPTIONS(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  return proxy(request, context, "OPTIONS");
}
