import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // This is a placeholder - actual auth check happens in components
  return NextResponse.next()
}

export const config = {
  matcher: ['/swipe', '/matches', '/chat/:path*', '/profile', '/settings'],
}

