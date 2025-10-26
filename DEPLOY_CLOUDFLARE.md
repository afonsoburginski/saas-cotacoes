# Deploy na Cloudflare para Orça Norte

## 📌 Método Recomendado: Cloudflare Pages

Para aplicações Next.js, o Cloudflare Pages é a melhor opção (mais simples e com melhor performance).

### Passo a Passo:

1. **Conectar Repositório**
   - Acesse: https://dash.cloudflare.com
   - Workers & Pages → Criar aplicação → Pages
   - Conecte seu GitHub

2. **Configurar Build**
   - **Framework preset:** Next.js
   - **Build command:** `npm run build`
   - **Root directory:** `/`
   - **Output directory:** `.next`

3. **Adicionar Variáveis de Ambiente**
   
   No painel do Cloudflare Pages, adicione:
   ```
   DATABASE_URL=postgresql://...
   BETTER_AUTH_SECRET=8kX9mP2qL...
   BETTER_AUTH_URL=https://www.orcanorte.com.br
   NEXT_PUBLIC_APP_URL=https://www.orcanorte.com.br
   NEXT_PUBLIC_SUPABASE_URL=https://vasfrygscudozjihcgfm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
   # ... todas as outras do env.txt
   ```

4. **Custom Domain**
   - Configure `orcanorte.com.br` no painel
   - Ajuste DNS se necessário

## 🐳 Alternativa: Docker Containers

Se preferir usar containers Docker, execute:

```bash
# Build
docker build -t orcanorte:latest .

# Test local
docker run -p 3000:3000 --env-file .env orcanorte:latest

# Deploy (via Wrangler)
wrangler login
wrangler deploy
```

## ✅ Checklist

- [ ] Conta Cloudflare criada
- [ ] Repositório GitHub conectado
- [ ] Build configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] Domínio configurado
- [ ] SSL ativado
- [ ] Testar deploy

## 🚀 Depois do Deploy

1. Verifique se o site está online: `https://orcanorte.com.br`
2. Teste todas as funcionalidades
3. Verifique logs na dashboard da Cloudflare
4. Configure Google Search Console com o novo domínio

