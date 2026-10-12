import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, getAdminCookieName } from '@/lib/admin-auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const cookie = request.cookies.get(getAdminCookieName())?.value;
  const valid = await verifyAdminSession(cookie);

  if (pathname.startsWith('/admin/login')) {
    if (valid) return NextResponse.redirect(new URL('/admin', request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!valid) return NextResponse.redirect(new URL('/admin/login', request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login') && !pathname.startsWith('/api/admin/logout') && !valid) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
