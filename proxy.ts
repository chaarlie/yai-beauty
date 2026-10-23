import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/admin/session-token";

// The two /admin pages a signed-out visitor needs: sign in, and the invite link
// that creates the account (each checks its own token).
const PUBLIC = new Set(["/admin/login", "/admin/setup"]);

// Gate for /admin. The public site is not matched at all (see config below).
// Signed-out visitors are sent to the login screen; the admin API answers 401.
// This is a first line only — it checks the cookie's signature, not that the
// session is still current; every page, action and route handler does that via
// lib/admin/session.ts.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // `trailingSlash: true` makes every path end in "/"; compare without it.
  const path = pathname.replace(/\/+$/, "");
  if (PUBLIC.has(path)) return NextResponse.next();

  if (verifyToken("session", request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();

  if (path.startsWith("/admin/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const login = new URL("/admin/login/", request.url);
  if (path !== "/admin") login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
