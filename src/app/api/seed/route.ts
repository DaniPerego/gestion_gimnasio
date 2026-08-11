import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Demo mode - data is stored in localStorage. No server-side seed needed.' 
  });
}
