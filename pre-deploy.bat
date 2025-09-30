@echo off
echo 🚀 Iniciando verificação pré-deploy...

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
  echo ❌ Node modules não encontrados. Execute: npm install
  exit /b 1
)

REM Verificar se as variáveis de ambiente estão configuradas
if not exist ".env" (
  echo ⚠️  Arquivo .env não encontrado. Configure as variáveis de ambiente.
  echo    Copie .env.example para .env e configure:
  echo    - VITE_SUPABASE_URL
  echo    - VITE_SUPABASE_ANON_KEY
  exit /b 1
)

REM Verificar se o build funciona
echo 🔨 Testando build de produção...
call npm run build

if %ERRORLEVEL% equ 0 (
  echo ✅ Build realizado com sucesso!
  echo 📦 Arquivos gerados em ./dist/
  echo.
  echo 📋 Próximos passos:
  echo 1. Configure o banco de dados no Supabase usando database-deploy.sql
  echo 2. Faça deploy usando um dos métodos em DEPLOY.md
  echo 3. Configure as variáveis de ambiente na plataforma escolhida
  echo.
  echo 🎉 Aplicativo pronto para deploy!
) else (
  echo ❌ Erro no build. Corrija os erros antes de fazer deploy.
  exit /b 1
)