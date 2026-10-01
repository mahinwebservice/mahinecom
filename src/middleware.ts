import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  const PUBLIC_ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
  const rootDomainBase = PUBLIC_ROOT_DOMAIN.split(':')[0];

  let currentHost = hostname;
  if (currentHost.includes(':')) {
    currentHost = currentHost.split(':')[0];
  }

  const isRootDomain =
    currentHost === 'localhost' ||
    currentHost === rootDomainBase ||
    currentHost.includes('vercel.app') || 
    currentHost === 'mahinsaas.web.app' || 
    currentHost === 'mahinsaas.firebaseapp.com';

  if (isRootDomain) {
    // 1. Root Super Admin paths (/superadmin or /mahinsaas)
    if (url.pathname === '/superadmin' || url.pathname.startsWith('/superadmin/')) {
      return NextResponse.rewrite(new URL('/home' + url.pathname, req.url));
    }

    if (url.pathname === '/mahinsaas') {
      return NextResponse.rewrite(new URL('/mahinsaas', req.url));
    }

    // 2. Root landing page
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/home', req.url));
    }

    // 3. Otherwise (like /store1/ecomsaas or /store1/mahinsaas), let Next.js match app/[tenant]/...
    return NextResponse.next();
  }

  // SUBDOMAIN LOGIC (For custom subdomains like store1.domain.com)
  let tenantId = currentHost.replace('.' + rootDomainBase, '');
  return NextResponse.rewrite(new URL('/' + tenantId + url.pathname + url.search, req.url));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
