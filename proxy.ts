import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = new URL(request.url);
  const token = request.cookies.get('access_token')?.value;

  const protectedPaths = ['/dashboard', '/segments', '/inference', '/inference-history'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && (pathname === '/login')) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
