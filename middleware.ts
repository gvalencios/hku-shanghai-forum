import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/jwt";

const PUBLIC_PATHS = ["/login"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("session")?.value;
  const session = token ? await verifySession(token) : null;

  // Redirect authenticated users away from login
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Block non-TA users from /ta routes
  if (path.startsWith("/ta") && session.role !== "ta") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\.).*)", ],
};
