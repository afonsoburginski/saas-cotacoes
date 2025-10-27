# 🧪 Teste de Integração

## ✅ PARA TESTAR:

### 1. **Testar API de Planos**
```bash
# Abra o navegador e acesse:
http://localhost:3000/api/plans

# Deve retornar:
{
  "data": [
    {
      "id": "basico",
      "nome": "Básico",
      "preco": 129.99,
      "precoFormatted": "R$ 129,99",
      "features": [...],
      ...
    },
    ...
  ]
}
```

### 2. **Testar Página de Preços**
- Acesse: `http://localhost:3000/landing`
- Verifique se os planos aparecem com:
  - ✅ Nome correto (Básico, Plus, Premium)
  - ✅ Preço correto (R$ 129,99, R$ 219,99, R$ 289,99)
  - ✅ Features vindas do Stripe
  - ✅ Ícones corretos

### 3. **Testar Checkout**
- Clique em qualquer plano
- Deve abrir o checkout do Stripe
- Preços devem estar corretos

### 4. **Testar Link de Pagamento Externo**
- Configure no Stripe Dashboard:
  - URL de redirecionamento: `https://orcanorte.com.br/checkout/stripe-success?session_id={CHECKOUT_SESSION_ID}`
- Teste o fluxo completo

---

## 🔍 VERIFICAÇÕES:

### Checklist:
- [ ] API `/api/plans` retorna dados
- [ ] Planos aparecem na landing page
- [ ] Preços estão corretos (R$ 129,99, R$ 219,99, R$ 289,99)
- [ ] Features aparecem corretamente
- [ ] Favicon carrega sem erro
- [ ] Checkout abre com preços corretos

---

## 📊 LOGS ESPERADOS:

```
📋 Produto Básico - Features: ["Perfil profissional no diretório", ...]
📋 Produto Plus - Features: ["Tudo do plano Básico", ...]
📋 Produto Premium - Features: ["Tudo do plano Plus", ...]
```

