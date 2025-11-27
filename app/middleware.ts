import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'es', 'fr'],
  defaultLocale: 'en'
});

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Check if it's an admin route (excluding login)
  // We need to handle locale prefixes: /en/admin, /admin, etc.
  const isAdminRoute = path.match(/^\/(?:en|es|fr)?\/admin/);
  const isLoginPage = path.match(/^\/(?:en|es|fr)?\/admin\/login/);

  if (isAdminRoute && !isLoginPage) {
    const token = await getToken({ req });
    
    // Check if user is authenticated and has ADMIN role
    if (!token || token.role !== 'ADMIN') {
      const locale = path.match(/^\/([a-z]{2})/)?.[1] || 'en';
      const loginUrl = new URL(`/${locale}/admin/login`, req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
