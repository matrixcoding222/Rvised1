import { NextResponse } from 'next/server'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Origin, x-user-email, x-user-tier',
  'Access-Control-Allow-Credentials': 'false',
  'Access-Control-Max-Age': '86400'
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  })
}

export async function GET() {
  const response = NextResponse.json({
    ok: true,
    status: 'ok',
    message: 'Rvised API is running',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    openaiReady: !!process.env.OPENAI_API_KEY
  }, {
    status: 200,
    headers: corsHeaders
  })
  
  // Explicitly set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export async function POST() {
  return GET();
}