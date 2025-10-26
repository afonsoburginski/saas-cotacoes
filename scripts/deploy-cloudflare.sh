#!/bin/bash

# Script de Deploy para Cloudflare - Orça Norte

echo "🚀 Iniciando deploy para Cloudflare..."

# Verificar se wrangler está instalado
if ! command -v wrangler &> /dev/null
then
    echo "❌ Wrangler não encontrado. Instalando..."
    npm install -g wrangler
fi

# Login (se necessário)
echo "📝 Verificando autenticação..."
wrangler whoami

# Build do Docker
echo "🔨 Build da imagem Docker..."
docker build -t orcanorte:latest .

if [ $? -ne 0 ]; then
    echo "❌ Erro no build Docker"
    exit 1
fi

echo "✅ Build concluído!"

# Deploy
echo "🚀 Fazendo deploy..."
wrangler deploy

echo "✅ Deploy concluído!"

