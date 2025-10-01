# 🔧 Troubleshooting - NetworkError no Login

## 🚨 Erro: "NetworkError when attempting to fetch resource"

Este erro geralmente indica problemas com:
1. Variáveis de ambiente não configuradas
2. URL do Supabase incorreta
3. Problemas de CORS
4. Configuração incorreta na plataforma de deploy

## ✅ Verificações Rápidas

### 1. Verificar Variáveis de Ambiente

**No desenvolvimento local:**
Confirme que o arquivo `.env` existe com:
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

**No deploy (Vercel/Netlify):**
Vá nas configurações do projeto e confirme que as variáveis estão configuradas.

### 2. Testar Conexão com Supabase

1. Faça login no [Supabase](https://supabase.com)
2. Vá em Settings > API
3. Confirme se:
   - Project URL está correto
   - anon/public key está correto
   - Projeto está ativo

### 3. Verificar URLs de Autenticação

No Supabase, vá em Authentication > Settings > Site URL:
- Para desenvolvimento: `http://localhost:3000`
- Para produção: `https://seu-dominio.vercel.app`

## 🛠️ Soluções por Plataforma

### Vercel
```bash
# Configurar variáveis de ambiente via CLI
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Ou pelo painel web:
# Project Settings > Environment Variables
```

### Netlify
```bash
# No painel web:
# Site Settings > Environment Variables
# ou via arquivo netlify.toml
```

## 🔍 Debug Temporário

Adicionei um componente DebugEnv na página de login que mostra:
- Se as variáveis estão sendo carregadas
- Primeiros caracteres da URL e key

**Para remover após teste:**
1. Remova `<DebugEnv />` de Login.tsx
2. Remova o import de DebugEnv
3. Delete src/components/DebugEnv.tsx

## 📋 Checklist de Resolução

- [ ] Variáveis de ambiente configuradas localmente
- [ ] Variáveis de ambiente configuradas no deploy
- [ ] URL do Supabase correta (sem barra final)
- [ ] Chave anônima correta
- [ ] Site URLs configuradas no Supabase
- [ ] Projeto Supabase ativo
- [ ] Deploy refeito após configurar variáveis

## 🚀 Passos de Resolução

1. **Teste local primeiro:**
   ```bash
   npm run 
   # Tente fazer login localmente
   ```

2. **Verifique as variáveis no build:**
   - Abra o console do navegador
   - Veja se o componente DebugEnv mostra as variáveis

3. **Configure no deploy:**
   - Adicione as variáveis na plataforma
   - Faça um novo deploy

4. **Configure no Supabase:**
   - Authentication > Settings
   - Adicione a URL do seu deploy

5. **Teste novamente**

## 💡 Dicas Extras

- Sempre usar `https://` na URL do Supabase
- Não incluir barra final na URL
- Aguardar alguns minutos após configurar variáveis
- Limpar cache do navegador após mudanças

## 🆘 Se nada funcionar

1. Verifique logs do Supabase (Dashboard > Logs)
2. Verifique logs da plataforma de deploy
3. Teste com curl/Postman na API do Supabase
4. Crie um novo projeto Supabase para teste