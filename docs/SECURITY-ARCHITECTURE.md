# 🔒 Arquitetura de Segurança - Orça Norte

## 📋 Visão Geral

Este documento descreve a arquitetura de segurança implementada na aplicação, seguindo as **melhores práticas do Next.js 15 com App Router**.

---

## 🏗️ Arquitetura em Camadas

### 1. **Middleware** (`middleware.ts`) - Camada Leve
**Responsabilidade**: Verificação BÁSICA de sessão

```typescript
✅ FAZ:
- Verifica se o usuário tem sessão válida (autenticado)
- Redireciona para home se não estiver autenticado
- Define rotas públicas que não precisam de autenticação

❌ NÃO FAZ:
- Verificação de roles (admin, fornecedor, etc)
- Verificação de assinatura ativa
- Consultas complexas ao banco de dados
- Chamadas para APIs externas (Stripe, etc)
```

**Por quê?**
- Middleware roda no Edge Runtime (limitado)
- Deve ser extremamente leve e rápido
- Executado em TODAS as requisições (alto custo)

---

### 2. **Layouts Protegidos** - Camada de Autorização

#### `/loja/layout.tsx` - Área de Fornecedores
**Responsabilidade**: Verificar ROLE de fornecedor

```typescript
✅ Verifica:
- Sessão autenticada (duplica middleware por segurança)
- Role do usuário ('fornecedor', 'loja', 'servico')
- Redireciona para home se não tiver permissão

💡 Nota sobre Assinatura:
- Verificação de assinatura está COMENTADA
- Permite acesso flexível à área mesmo sem assinatura ativa
- Cada página pode decidir o que mostrar/bloquear
- Se quiser bloquear tudo, basta descomentar o código
```

#### `/admin/layout.tsx` - Área Administrativa
**Responsabilidade**: Verificar ROLE de admin

```typescript
✅ Verifica:
- Sessão autenticada
- Role === 'admin'
- Redireciona para home se não for admin
```

---

### 3. **Server Components** - Camada de Dados

Cada página pode fazer verificações adicionais:
- Verificar assinatura ativa antes de mostrar conteúdo premium
- Verificar permissões específicas (editar produto, etc)
- Validar se o usuário pode acessar aquele recurso específico

---

## 🔐 Fluxo de Segurança

```
1. Usuário faz requisição → Middleware
   ↓
   ├─ Rota pública? → ✅ Permite
   ├─ Sem sessão? → ❌ Redireciona para /
   └─ Com sessão? → ✅ Permite (vai para passo 2)

2. Requisição chega no Layout
   ↓
   ├─ /admin/* → Verifica role === 'admin'
   ├─ /loja/* → Verifica role em ['fornecedor', 'loja', 'servico']
   └─ Se falhar → ❌ Redireciona para /

3. Layout renderiza → Server Component (página)
   ↓
   └─ Faz verificações específicas (assinatura, permissões, etc)
```

---

## 🎯 Rotas e Proteções

| Rota | Middleware | Layout | Verificação Extra |
|------|------------|--------|-------------------|
| `/` | ❌ Pública | - | - |
| `/explorar` | ❌ Pública | - | - |
| `/categoria/*` | ❌ Pública | - | - |
| `/fornecedor/*` | ❌ Pública | - | - |
| `/loja/*` | ✅ Sessão | ✅ Role fornecedor | (Opcional) Assinatura |
| `/admin/*` | ✅ Sessão | ✅ Role admin | - |
| `/api/auth/*` | ❌ Pública | - | - |
| `/api/orders/*` | ✅ Sessão | - | Valida owner |
| `/api/stores/*` | ✅ Sessão | - | Valida owner |

---

## ✅ Vantagens desta Arquitetura

1. **Performance**: Middleware extremamente leve
2. **Manutenibilidade**: Regras organizadas por contexto
3. **Flexibilidade**: Cada área pode ter regras específicas
4. **Escalabilidade**: Fácil adicionar novas áreas protegidas
5. **Best Practices**: Segue recomendações oficiais do Next.js
6. **DX (Developer Experience)**: Código limpo e fácil de entender

---

## 🚨 Importante: Nunca Fazer

### ❌ NO MIDDLEWARE:
```typescript
// ❌ NÃO FAÇA ISSO
export async function middleware(request) {
  const response = await fetch('/api/check-subscription') // Chamada API
  const hasStripe = await stripe.subscriptions.list() // API externa
  const user = await db.select().from(users) // Query pesada
}
```

### ✅ NO LAYOUT:
```typescript
// ✅ FAÇA ISSO
export default async function Layout() {
  const session = await auth.api.getSession()
  const subscription = await checkSubscription() // OK aqui!
  const userData = await db.query.users.findFirst() // OK aqui!
}
```

---

## 🔧 Como Adicionar Nova Área Protegida

1. **Criar pasta** em `app/(routes)/nova-area/`
2. **Criar layout** `nova-area/layout.tsx`:
```typescript
export default async function NovaAreaLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) redirect('/')
  if (session.user.role !== 'role-esperado') redirect('/')
  
  return <>{children}</>
}
```
3. **Atualizar middleware** (se necessário adicionar exceção):
```typescript
const publicPaths = [..., '/nova-area-publica']
```

---

## 📚 Referências

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Better Auth](https://www.better-auth.com/docs)
- [Server Components Security](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

**Última atualização**: ${new Date().toISOString().split('T')[0]}
**Mantido por**: Equipe Orça Norte

