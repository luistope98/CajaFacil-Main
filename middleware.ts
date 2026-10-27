import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === '/login';

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    const dest = role === 'ADMIN' ? '/user/admin/dashboard' : '/user/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (pathname.startsWith('/user/admin')) {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|terms).*)'],
};