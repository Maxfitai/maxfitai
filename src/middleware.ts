import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://maxfitai.com',
  'https://admin.maxfitai.com',
]

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin)

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response
  }

  let response: NextResponse

  if (request.nextUrl.pathname.startsWith('/admin')) {
    response = NextResponse.next()
    // Don't force-delete cookies on every admin request — this breaks auth!
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
  } else {
    response = NextResponse.next()
  }

  // Set CORS headers dynamically based on request origin
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}