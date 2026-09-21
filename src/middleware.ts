import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  let currentHost = hostname;
  if (process.env.NODE_ENV === 'development') {
    currentHost = currentHost.replace(':' + PUBLIC_ROOT_DOMAIN.split(':')[1], '');
  }

  // ROOT DOMAIN LOGIC
  if (
    currentHost === 'localhost' ||
    currentHost === PUBLIC_ROOT_DOMAIN.split(':')[0] ||
    currentHost === 'mahinsaas.web.app' || 
    currentHost === 'mahinsaas.firebaseapp.com'
  ) {
    if (url.pathname === '/' || url.pathname.startsWith('/superadmin')) {
      return NextResponse.rewrite(new URL('/home' + url.pathname, req.url));
    }
    return NextResponse.next();
  }

  // SUBDOMAIN / CUSTOM DOMAIN LOGIC
  let tenantId = currentHost.replace('.' + PUBLIC_ROOT_DOMAIN.split(':')[0], '');
  tenantId = tenantId.replace('.mahinsaas.web.app', '').replace('.mahinsaas.firebaseapp.com', '');

  return NextResponse.rewrite(new URL('/' + tenantId + url.pathname + url.search, req.url));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
