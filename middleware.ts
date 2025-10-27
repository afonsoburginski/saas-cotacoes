import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { betterFetch } from '@better-fetch/fetch'
import type { Session } from 'better-auth/types'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir sitemap.xml e robots.txt sem autenticação
  if (pathname.includes('/sitemap.xml') || pathname.includes('/robots.txt')) {
    return NextResponse.next()
  }

  // 1. Rotas totalmente públicas (não requerem autenticação)
  const publicPaths = [
    '/',
    '/explorar',
    '/categoria',
    '/fornecedor',
    '/comparar',
    '/subscription/expired',
    '/admin',
  ]
  
  const publicApiPaths = [
    '/api/auth', 
    '/api/webhooks', 
    '/api/storage',
    '/api/products',
    '/api/services',
    '/api/stores',
    '/api/categories',
    '/api/service-providers'
  ]

  // Permitir rotas públicas específicas de checkout e loja
  const checkoutPublicPaths = [
    '/checkout/stripe-success',
    '/checkout/success',
    '/checkout/external'
  ]
  
  if (checkoutPublicPaths.includes(pathname) || pathname === '/loja/loading') {
    return NextResponse.next()
  }

  // Permitir rotas públicas
  if (
    publicPaths.some(p => pathname === p || pathname.startsWith(`${p}/`)) ||
    publicApiPaths.some(p => pathname.startsWith(p))
  ) {
    return NextResponse.next()
  }
  
  // Permitir /admin/login sem autenticação
  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }
  
  // Permitir /admin/dashboard sem autenticação (vai ser controlado pelo layout)
  if (pathname.startsWith('/admin/dashboard')) {
    return NextResponse.next()
  }

  // 2. Verificar sessão usando Better Auth diretamente
  try {
    const { data: session } = await betterFetch<Session>(
      '/api/auth/get-session',
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      }
    )

    // Se não tem sessão, redireciona para home
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Sessão válida - permite continuar
    // As verificações de role e assinatura serão feitas nos layouts específicos
    return NextResponse.next()
    
  } catch (error) {
    console.error('Middleware auth error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml
     * - robots.txt
     * Isso previne que o middleware rode em assets desnecessários.
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

