import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Public routes that don't need auth
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/callback', '/onboarding']
  
  // Check if route is public
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // For protected routes, we'll let the AuthProvider handle the redirect
  // This middleware just ensures the route is accessible
  // Actual auth check happens client-side in AuthProvider
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/swipe/:path*',
    '/matches/:path*',
    '/chat/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/dms/:path*',
    '/admin/:path*',
  ],
}

