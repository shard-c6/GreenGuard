import { NextRequest, NextResponse } from 'next/server';

const CONSULTANT_BACKEND_URL = process.env.CONSULTANT_API_URL || 'http://localhost:5002/api';
const CONSULTANT_API_KEY = process.env.CONSULTANT_API_KEY || 'gg_secret_consultant_key_2026';

async function handleProxy(req: NextRequest, context: { params: { path?: string[] } }) {
  // Await params per Next.js 15 routing standards if required
  const params = await context.params;
  const subpath = params.path ? params.path.join('/') : '';
  const targetUrl = `${CONSULTANT_BACKEND_URL}/consultant/${subpath}`;
  
  // Clone headers
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });
  
  // Inject the secure API key on the server-side
  headers.set('x-api-key', CONSULTANT_API_KEY);

  try {
    const requestOptions: RequestInit = {
      method: req.method,
      headers,
      body: req.body,
      // @ts-ignore - needed for passing request streams in Node/Next
      duplex: 'half',
    };

    const response = await fetch(targetUrl, requestOptions);
    const body = await response.arrayBuffer();

    return new Response(body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Secure proxy connection failed:', error);
    return NextResponse.json(
      { error: 'Could not connect to secure consultant microservice.' },
      { status: 500 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
