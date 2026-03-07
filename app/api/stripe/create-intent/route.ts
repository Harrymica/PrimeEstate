import { NextRequest, NextResponse } from 'next/server';

// DEPRECATED: Use /api/stripe/checkout instead
// This redirects any old calls to the new checkout endpoint
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Forward to /api/stripe/checkout
  const origin = request.headers.get('origin') || 'http://localhost:3000';
  const res = await fetch(`${origin}/api/stripe/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') || '',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
