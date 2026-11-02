import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionJwtInEdge,
} from "@/lib/auth/session-cookie";
import { applySecurityHeaders } from "@/lib/security-headers";

const PUBLIC_PAGE_PATHS = new Set(["/login"]);
const PUBLIC_API_PATHS = new Set([
  "/api/v1/health",
  "/api/v1/auth/login",
  "/api/v1/auth/logout",
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PAGE_PATHS.has(pathname) || PUBLIC_API_PATHS.has(pathname)) {
    return true;
  }

  // Next internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    // Authenticated users hitting /login go to dashboard.
    if (pathname === "/login") {
      const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      const authSecret = process.env.AUTH_SECRET;

      if (sessionToken && authSecret) {
        const payload = await verifySessionJwtInEdge(sessionToken, authSecret);
        if (payload) {
          return withSecurityHeaders(
            NextResponse.redirect(new URL("/dashboard", request.url))
          );
        }
      }
    }

    return withSecurityHeaders(NextResponse.next());
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authSecret = process.env.AUTH_SECRET;

  if (!sessionToken || !authSecret) {
    return redirectToLogin(request, pathname);
  }

  const payload = await verifySessionJwtInEdge(sessionToken, authSecret);
  if (!payload) {
    return redirectToLogin(request, pathname);
  }

  return withSecurityHeaders(NextResponse.next());
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  applySecurityHeaders(response.headers);
  return response;
}

function redirectToLogin(request: NextRequest, pathname: string) {
  if (pathname.startsWith("/api/")) {
    return withSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication required.",
          },
        },
        { status: 401 }
      )
    );
  }

  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") {
    loginUrl.searchParams.set("next", pathname);
  }
  return withSecurityHeaders(NextResponse.redirect(loginUrl));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
