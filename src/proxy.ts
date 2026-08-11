import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple proxy for demo mode - allows all routes through
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
