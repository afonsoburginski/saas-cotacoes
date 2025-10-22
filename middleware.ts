import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Rotas públicas (não precisam autenticação)
  const publicPaths = ['/', '/api/auth', '/api/products', '/api/services', '/api/stores', '/api/categories', '/api/plans', '/api/webhooks', '/api/user/subscription-status', '/explorar', '/categoria', '/fornecedor', '/subscription/expired']
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next()
  }

  // Verificar se tem cookie de sessão do better-auth
  const sessionToken = request.cookies.get('better-auth.session_token')?.value
  
  // Se não tem sessão, redireciona para home
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Para rotas protegidas complexas (/loja, /admin, etc), deixar a verificação
  // detalhada para as próprias páginas/API routes que rodam no Node.js runtime
  // O middleware só faz a verificação básica de sessão

  // Proteção básica de rotas /admin
  if (path.startsWith('/admin')) {
    // Verificação detalhada de role será feita na página
    return NextResponse.next()
  }

  // Proteção básica de rotas /loja
  if (path.startsWith('/loja')) {
    // Exceções: assinatura expirada e checkout
    if (path === '/subscription/expired' || path === '/checkout') {
      return NextResponse.next()
    }
    
    // Verificação detalhada de subscription será feita na página
    return NextResponse.next()
  }

  // Proteção básica de rotas consumidor
  const consumerPaths = ['/carrinho', '/listas']
  if (consumerPaths.some(p => path.startsWith(p))) {
    // Verificação detalhada de role será feita na página
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/loja/:path*',
    '/explorar/:path*',
    '/carrinho/:path*',
    '/comparar/:path*',
    '/listas/:path*',
    '/categoria/:path*',
    '/fornecedor/:path*',
    '/onboarding',
    '/checkout',
  ]
}

