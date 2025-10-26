# ⚡ Solução: Erro DATABASE_URL is not set

## ❌ Problema

O build falhou porque as variáveis de ambiente não foram configuradas no Cloudflare Pages.

---

## ✅ SOLUÇÃO (2 minutos)

### 1. Adicionar Variáveis de Ambiente

No painel do Cloudflare:

1. **Vá em:** Projeto → **Settings** → **Environment Variables**
2. **Clique em:** Add variable
3. **Adicione TODAS essas:**

```
DATABASE_URL=seu_database_url_aqui

BETTER_AUTH_SECRET=seu_secret_aqui

GOOGLE_CLIENT_ID=seu_client_id_aqui

GOOGLE_CLIENT_SECRET=seu_client_secret_aqui

BETTER_AUTH_URL=https://www.orcanorte.com.br

NEXT_PUBLIC_APP_URL=https://www.orcanorte.com.br

STRIPE_API_PUBLIC=sua_stripe_public_key

STRIPE_API_SECRET=sua_stripe_secret_key

STRIPE_WEBHOOK_SECRET=seu_webhook_secret

STRIPE_PORTAL_CONFIGURATION_ID=seu_portal_id

SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key

NEXT_PUBLIC_SUPABASE_URL=seu_supabase_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_anon_key
```

**⚠️ IMPORTANTE:** Use as variáveis REAIS do arquivo `env.txt` no painel do Cloudflare!

4. **Clique em:** Save

### 2. Re-deploy

Vá em: **Deployments** → **Retry deployment**

---

## 🎉 PRONTO!

O build vai funcionar agora!

---

## 📝 Alternativa: Configurar no código

Se preferir, posso fazer as variáveis serem opcionais durante o build.

🗑️ Você quer que eu remova a exigência de DATABASE_URL durante o build?

