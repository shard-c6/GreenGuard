import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
      const geo = request.geo || {};
      
      // Default to New Delhi, India coordinates during local dev or if geo is unavailable
      const lat = geo.latitude || '28.6139';
      const lng = geo.longitude || '77.2090';
      const city = geo.city || 'New Delhi';
      const country = geo.country || 'IN';

      const url = request.nextUrl.clone();
      url.searchParams.set('lat', lat);
      url.searchParams.set('lng', lng);
      url.searchParams.set('city', city);
      url.searchParams.set('country', country);
      url.searchParams.set('geo_source', geo.latitude ? 'edge' : 'fallback');

      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/map'],
};
