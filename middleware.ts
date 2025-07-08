import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // /admin 경로: admin 권한만 허용
    if (pathname.startsWith('/admin')) {
      if (token?.type !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // /user 경로: admin 또는 user 권한 허용
    if (pathname.startsWith('/user')) {
      if (!token?.type || (token.type !== 'admin' && token.type !== 'user')) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { 
  matcher: ["/admin/:path*", "/user/:path*"] 
}