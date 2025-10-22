import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Definição de rotas com diferentes níveis de acesso
  const fullyPublicPaths = ['/', '/explorar', '/categoria', '/fornecedor', '/subscription/expired']
  const authApiPaths = ['/api/auth', '/api/webhooks']
  const storeExceptions = ['/loja/assinatura', '/checkout']

  // 2. Rotas totalmente públicas que não requerem sessão
  if (fullyPublicPaths.some(p => pathname.startsWith(p)) || authApiPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // 3. Verificar sessão para todas as outras rotas via API
  // Delegamos para uma API Route para evitar importar better-auth no Edge Runtime
  const checkAuthUrl = new URL('/api/auth/check-session', request.url)
  const authResponse = await fetch(checkAuthUrl, {
    headers: { cookie: request.headers.get('cookie') || '' },
  })

  if (!authResponse.ok) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const { user } = await authResponse.json()

  if (!user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 4. Proteção de rotas de Admin
  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 5. Proteção de rotas da Loja (requer assinatura)
  if (pathname.startsWith('/loja')) {
    // Permitir acesso a páginas de gerenciamento de assinatura
    if (storeExceptions.some(p => pathname.startsWith(p))) {
      return NextResponse.next()
    }

    // Apenas fornecedores podem acessar
    if (!['fornecedor', 'loja'].includes(user.role || '')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Delegar verificação de assinatura para uma API Route para manter o middleware leve
    const checkSubUrl = new URL('/api/auth/check-sub', request.url)
    const response = await fetch(checkSubUrl, {
      headers: { cookie: request.headers.get('cookie') || '' },
    })

    // Se a verificação falhar (API fora do ar ou erro), bloqueia por segurança
    if (!response.ok) {
      return NextResponse.redirect(new URL('/subscription/expired', request.url))
    }

    const { isActive } = await response.json()
    if (!isActive) {
      return NextResponse.redirect(new URL('/subscription/expired', request.url))
    }
  }
  
  // 6. Se todas as verificações passaram, permitir acesso
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Isso previne que o middleware rode em assets desnecessários.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

