#!/bin/bash

# Script de verificação pré-deploy
echo "🚀 Iniciando verificação pré-deploy..."

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
  echo "❌ Node modules não encontrados. Execute: npm install"
  exit 1
fi

# Verificar se as variáveis de ambiente estão configuradas
if [ ! -f ".env" ]; then
  echo "⚠️  Arquivo .env não encontrado. Configure as variáveis de ambiente."
  echo "   Copie .env.example para .env e configure:"
  echo "   - VITE_SUPABASE_URL"
  echo "   - VITE_SUPABASE_ANON_KEY"
  exit 1
fi

# Verificar se o build funciona
echo "🔨 Testando build de produção..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build realizado com sucesso!"
  echo "📦 Arquivos gerados em ./dist/"
  echo ""
  echo "📋 Próximos passos:"
  echo "1. Configure o banco de dados no Supabase usando database-deploy.sql"
  echo "2. Faça deploy usando um dos métodos em DEPLOY.md"
  echo "3. Configure as variáveis de ambiente na plataforma escolhida"
  echo ""
  echo "🎉 Aplicativo pronto para deploy!"
else
  echo "❌ Erro no build. Corrija os erros antes de fazer deploy."
  exit 1
fi