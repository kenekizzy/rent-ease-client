import { NextRequest, NextResponse } from 'next/server';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64url → Base64 → JSON
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const isLandlordPath = pathname.startsWith('/landlord-dashboard');
  const isTenantPath = pathname.startsWith('/tenant-dashboard');

  if (!isLandlordPath && !isTenantPath) return NextResponse.next();

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT (no verify — edge runtime limitation; verification happens on API calls)
  const payload = decodeJwtPayload(token);
  const role = payload?.role;

  if (isLandlordPath && role !== 'landlord') {
    return NextResponse.redirect(new URL('/tenant-dashboard', request.url));
  }
  if (isTenantPath && role !== 'tenant') {
    return NextResponse.redirect(new URL('/landlord-dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/landlord-dashboard/:path*', '/tenant-dashboard/:path*'],
};
