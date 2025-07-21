// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Required to support NextAuth JWT
const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });

  // Redirect unauthenticated users to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Block CUSTOMER from accessing admin/dashboard paths
  const restrictedPaths = ['/orders','/products', '/dashboard'];
  const pathname = req.nextUrl.pathname;

  const isRestricted = restrictedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isRestricted && token.role === 'CUSTOMER') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/products', '/orders'],
};
