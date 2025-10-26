# Orça Norte - Plataforma de Cotações B2B

Plataforma para cotações de materiais de construção, conectando consumidores e fornecedores.

🌐 **Site:** https://orcanorte.com.br

---

## 🚀 Deploy

### Cloudflare Pages (Recomendado)

1. Acesse: https://dash.cloudflare.com
2. Workers & Pages → Pages → Criar aplicação
3. Conecte GitHub
4. Configurações:
   - Framework: Next.js
   - Build: `npm run build`
   - Output: `.next`
5. Adicione variáveis de `env.txt`
6. Deploy!

---

## 🛠️ Comandos

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Testar com Docker
npm run docker:up

# Deploy Cloudflare
npm run cf:deploy
```

---

## 📁 Estrutura

```
app/                    # Next.js 14 App Router
components/             # Componentes React
hooks/                  # Custom hooks
lib/                    # Utilitários
drizzle/                # Database schema
```

---

## ⚙️ Variáveis de Ambiente

Copie `env.txt` para `.env` (já feito)

---

## 🐳 Docker

```bash
# Build
docker build -t orcanorte .

# Run
docker run -p 3000:3000 --env-file .env orcanorte

# Compose
docker-compose up
```

---

## ✅ Status

- ✅ Site funcionando
- ✅ SEO configurado
- ✅ Deploy automático
- ✅ API pública
- ✅ Exclusão de produtos/serviços funcionando

---

## 📚 Tech Stack

- Next.js 14
- TypeScript
- PostgreSQL (Supabase)
- Drizzle ORM
- Tailwind CSS
- Shadcn/ui
- Stripe
- Better Auth

---

**Tudo funcionando! 🎉**
