import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    try {
      const decodedToken = verifyToken(token);
      if (!decodedToken) {
        return NextResponse.rewrite(new URL('/not-found', request.url));
      }
    } catch (error) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
  }

  return NextResponse.next();
}

function verifyToken(token: string): { role: string } {
  const secretKey = process.env.JWT_SECRET || 'default_secret'; 
  const jwt = require('jsonwebtoken'); 
  return jwt.verify(token, secretKey) as { role: string };
}

export const config = {
  matcher: '/api/:path*',
};
