import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // For demo mode, import happens client-side via localStorage
  return NextResponse.json({ 
    message: 'Demo mode: use client-side import',
    success: true 
  });
}
