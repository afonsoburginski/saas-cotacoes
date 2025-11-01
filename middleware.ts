import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { betterFetch } from '@better-fetch/fetch'
import type { Session } from 'better-auth/types'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ⚡ OTIMIZAÇÃO: Verificar rotas de API públicas PRIMEIRO (mais rápido)
  const publicApiPaths = [
    '/api/auth', 
    '/api/webhooks', 
    '/api/storage',
    '/api/products',
    '/api/services',
    '/api/stores',
    '/api/categories',
    '/api/service-providers',
    '/api/advertisements'
  ]
  
  // Se for API pública, retornar IMEDIATAMENTE sem fazer nada mais
  if (publicApiPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

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
    '/carrinho',
    '/subscription/expired',
    '/admin',
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

  // Permitir rotas públicas - retornar IMEDIATAMENTE sem verificação de sessão
  if (
    publicPaths.some(p => pathname === p || pathname.startsWith(`${p}/`))
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

  // 2. Verificar sessão APENAS para rotas protegidas
  // (rotas públicas já foram tratadas acima)
  try {
    const { data: session } = await betterFetch<Session>(
      '/api/auth/get-session',
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
        // Timeout rápido para não travar
        signal: AbortSignal.timeout(2000),
      }
    )

    // Se não tem sessão, redireciona para home
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Sessão válida - permite continuar
    return NextResponse.next()
    
  } catch (error) {
    // Em caso de erro (timeout, etc), permitir continuar (melhor que bloquear)
    // O layout vai fazer a verificação adequada
    return NextResponse.next()
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

