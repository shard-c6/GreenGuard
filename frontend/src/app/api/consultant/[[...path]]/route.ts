import { NextRequest, NextResponse } from 'next/server';

const CONSULTANT_BACKEND_URL = process.env.CONSULTANT_API_URL || 'http://localhost:5002/api';

const CONSULTANT_API_KEY: string = (() => {
  const key = process.env.CONSULTANT_API_KEY;
  if (!key) {
    throw new Error('FATAL: CONSULTANT_API_KEY is not configured');
  }
  return key;
})();

async function handleProxy(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  const subpath = params.path ? params.path.join('/') : '';
  const targetUrl = `${CONSULTANT_BACKEND_URL}/consultant/${subpath}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });

  headers.set('x-api-key', CONSULTANT_API_KEY);

  try {
    let requestBody: ArrayBuffer | undefined = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      requestBody = await req.arrayBuffer();
    }

    const requestOptions: RequestInit = {
      method: req.method,
      headers,
      body: requestBody,
    };

    const response = await fetch(targetUrl, requestOptions);
    const body = await response.arrayBuffer();

    return new Response(body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Secure proxy connection failed:', {
      targetUrl,
      method: req.method,
      error: err.message
    });
    return NextResponse.json(
      {
        error: 'Could not connect to secure consultant microservice.',
        details: err.message
      },
      { status: 500 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
