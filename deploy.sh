#!/bin/bash

# Script de Deploy para Vercel
# Este script automatiza o processo de deploy do projeto

echo "🚀 Iniciando deploy do Sistema de Gestão Financeira..."

# Verificar se está em um repositório git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este não é um repositório Git."
    echo "💡 Execute: git init && git add . && git commit -m 'Initial commit'"
    exit 1
fi

# Verificar se as variáveis de ambiente estão configuradas
if [ ! -f ".env.production" ]; then
    echo "⚠️  Arquivo .env.production não encontrado."
    echo "💡 Certifique-se de configurar as variáveis de ambiente no dashboard da Vercel."
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Recomendado Node.js 18 ou superior. Versão atual: $(node --version)"
fi

echo "📦 Instalando dependências..."
npm ci --production=false

echo "🔍 Verificando tipos TypeScript..."
npm run type-check

echo "🧹 Executando linter..."
npm run lint

echo "🏗️  Executando build de produção..."
npm run build:prod

echo "📊 Verificando tamanho dos chunks..."
ls -la dist/assets/ | grep -E '\.(js|css)$'

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📥 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "🚢 Fazendo deploy para Vercel..."
vercel --prod

echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Verifique se as variáveis de ambiente estão configuradas no dashboard da Vercel"
echo "   2. Configure as URLs do Supabase nas variáveis de ambiente"
echo "   3. Teste a aplicação na URL fornecida pela Vercel"
echo ""
echo "📚 Documentação completa disponível no README.md"