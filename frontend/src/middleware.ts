import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { geolocation } from '@vercel/functions';

/**
 * Next.js Edge Middleware
 * Intercepts requests to the /map page, extracts Vercel Edge Geolocation metadata,
 * and performs a transparent rewrite to append location query parameters.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Intercept the map page to apply Edge Geolocation coordinates
  if (pathname === '/map') {
    // If the coordinates are already explicitly specified in the query parameters, skip rewrite
    if (!searchParams.has('lat') || !searchParams.has('lng')) {
      const geo = geolocation(request) || {};
      
      if (geo.latitude && geo.longitude) {
        const url = request.nextUrl.clone();
        url.searchParams.set('lat', geo.latitude);
        url.searchParams.set('lng', geo.longitude);
        url.searchParams.set('city', geo.city || '');
        url.searchParams.set('country', geo.country || '');
        url.searchParams.set('geo_source', 'edge');
        return NextResponse.rewrite(url);
      }
      
      // No valid edge geolocation, let the client handle fallback.
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/map'],
};
