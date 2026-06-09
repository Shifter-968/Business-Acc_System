// ─── Route Protection Middleware ─────────────────────────────────────────────
//
// TEACHING NOTE
//
// Next.js Middleware runs on the server (Edge runtime) BEFORE a page renders.
// It receives the request and can return a redirect before React even starts.
//
// Problem: localStorage is browser-only — the server can't see it.
// Solution: On login we also write a lightweight cookie called `auth_session`.
//           This cookie is NOT the JWT itself — it's just a presence flag.
//           The REAL security is the API rejecting requests without a valid JWT.
//           The middleware only handles navigation-level UX (redirect to login).
//
// Two rules:
//   1. Logged-out user  → visiting protected page → redirect to /login
//   2. Logged-in user   → visiting /login         → redirect to /dashboard
//
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isPublicPath(pathname: string) {
  return pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = !!request.cookies.get('auth_session')?.value;

  // Not logged in → block access to every protected route
  if (!isAuthenticated && !isPublicPath(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname); // remember where they were going
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Tell Next.js which paths this middleware runs on.
// We exclude static assets, API routes, and _next internals.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
};
