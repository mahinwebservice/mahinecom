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
    // 1. Root landing page -> Serve root src/app/page.tsx directly
    if (url.pathname === '/') {
      return NextResponse.next();
    }

    // 2. Root Super Admin paths (/superadmin)
    if (url.pathname === '/superadmin' || url.pathname.startsWith('/superadmin/')) {
      return NextResponse.rewrite(new URL('/home' + url.pathname, req.url));
    }

    // 3. /mahinsaas root superadmin login
    if (url.pathname === '/mahinsaas') {
      return NextResponse.next();
    }

    // 4. /saasecom client merchant login
    if (url.pathname === '/saasecom') {
      return NextResponse.next();
    }

    // 4. Otherwise (like /store1, /store1/ecomsaas, /store1/mahinsaas), let Next.js match app/[tenant]/...
    return NextResponse.next();
  }

  // Custom domain merchant login rewrite
  if (url.pathname === '/saasecom' || url.pathname === '/ecomsaas') {
    return NextResponse.rewrite(new URL('/saasecom?customDomain=' + currentHost, req.url));
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
