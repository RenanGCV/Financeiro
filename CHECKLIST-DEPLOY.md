# ✅ Checklist de Deploy - Gestão Financeira

## 📋 Preparação do Ambiente

- [x] ✅ Build de produção funcionando
- [x] ✅ Todos os erros TypeScript corrigidos
- [x] ✅ Arquivos de configuração criados
- [x] ✅ Scripts SQL consolidados

## 🗄️ Banco de Dados (Supabase)

- [ ] Projeto Supabase criado
- [ ] Script `database-deploy.sql` executado
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas de segurança ativas
- [ ] Autenticação configurada

## 🌐 Deploy da Aplicação

### Opção 1: Vercel
- [ ] Conta Vercel criada
- [ ] Repositório conectado
- [ ] Arquivo `vercel.json` corrigido (sem `functions`)
- [ ] Variáveis de ambiente configuradas:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy realizado sem erros

### Opção 2: Netlify
- [ ] Conta Netlify criada
- [ ] Site criado (manual ou GitHub)
- [ ] Variáveis de ambiente configuradas
- [ ] Build settings configurados:
  - Build command: `npm run build`
  - Publish directory: `dist`

## 🔧 Configuração

- [ ] URLs de redirecionamento configuradas no Supabase
- [ ] Teste de login/cadastro funcionando
- [ ] Todas as funcionalidades testadas

## 📊 Funcionalidades para Testar

- [ ] Login/Cadastro de usuários
- [ ] Criar receitas
- [ ] Criar despesas (normais e parceladas)
- [ ] Criar investimentos
- [ ] Sistema de tags
- [ ] Dashboard (mês atual)
- [ ] Planejamento mensal
- [ ] Relatórios
- [ ] Meta de saldo
- [ ] Simulações

## 🚨 Troubleshooting

### Se aparecer erro de conexão:
1. Verifique as variáveis de ambiente
2. Confirme se o Supabase está funcionando
3. Verifique se as políticas RLS estão corretas

### Se aparecer 404 em rotas:
1. Confirme se o arquivo `_redirects` (Netlify) ou `vercel.json` (Vercel) está configurado
2. Verifique se o SPA redirect está ativo

### Se aparecer erro de autenticação:
1. Verifique as configurações de auth no Supabase
2. Confirme as URLs de redirecionamento

## 📁 Arquivos Importantes

- `database-deploy.sql` - Script completo do banco
- `DEPLOY.md` - Guia detalhado de deploy
- `vercel.json` - Configuração Vercel
- `public/_redirects` - Configuração Netlify
- `.env.example` - Exemplo de variáveis de ambiente

## 🎉 Após o Deploy

1. Teste todas as funcionalidades
2. Configure monitoramento (se necessário)
3. Documente a URL de produção
4. Configure backup do banco (opcional)

---

**Aplicativo pronto para produção! 🚀**

URL de Produção: _[preencha após deploy]_
Data do Deploy: _[preencha após deploy]_