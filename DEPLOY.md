# Guia de Deploy - Aplicativo de Gestão Financeira

Este guia explica como fazer o deploy do aplicativo de gestão financeira.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com) ou [Netlify](https://netlify.com)
- Node.js 18+

## 🗄️ Configuração do Banco de Dados

### 1. Configure o Supabase

1. Crie um novo projeto no Supabase
2. Execute os scripts SQL na seguinte ordem:
   - `database-complete-fix.sql` - Estrutura principal das tabelas
   - `meta-saldo.sql` - Tabelas para metas de saldo
   - `update-parcelamento.sql` - Campos de parcelamento (se necessário)

### 2. Configure a autenticação

No painel do Supabase:
- Vá em Authentication > Settings
- Configure os provedores de login (Email/Password habilitado por padrão)
- Configure as URLs de redirecionamento se necessário

### 3. Configure Row Level Security (RLS)

Os scripts SQL já incluem as políticas RLS necessárias para segurança.

## 🌐 Deploy no Vercel

### 1. Preparação

```bash
# Clone o repositório
git clone <your-repo-url>
cd Financeiro

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### 2. Configure as variáveis de ambiente

Edite o arquivo `.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Deploy

```bash
# Instale a CLI do Vercel
npm i -g vercel

# Deploy
vercel

# Configure as variáveis de ambiente no Vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy final
vercel --prod
```

## 🌐 Deploy no Netlify

### 1. Build local

```bash
npm run build
```

### 2. Upload manual

1. Acesse [Netlify](https://netlify.com)
2. Arraste a pasta `dist` para o deploy
3. Configure as variáveis de ambiente:
   - Site settings > Environment variables
   - Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### 3. Deploy contínuo (GitHub)

1. Conecte o repositório GitHub
2. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables: conforme acima

## 🔧 Variáveis de Ambiente de Produção

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase | `eyJ0eXAiOiJKV1Q...` |

## 📁 Estrutura de Deploy

```
dist/
├── index.html          # Página principal
├── assets/            
│   ├── index-[hash].css # Estilos compilados
│   └── index-[hash].js  # JavaScript compilado
└── vite.svg           # Favicon
```

## ✅ Checklist de Deploy

- [ ] Banco de dados Supabase configurado
- [ ] Scripts SQL executados
- [ ] Variáveis de ambiente configuradas
- [ ] Build de produção testado localmente
- [ ] Deploy realizado
- [ ] Funcionalidades testadas em produção

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o RLS está habilitado nas tabelas

### Erro de autenticação
- Verifique as configurações de auth no Supabase
- Confirme as URLs de redirecionamento

### Erro 404 em rotas
- Configure redirecionamento para SPA no seu provedor de hosting
- Netlify: criar arquivo `_redirects` com `/* /index.html 200`
- Vercel: `vercel.json` já está configurado

## 📊 Monitoramento

Após o deploy, monitore:
- Logs de erro no console do navegador
- Métricas de performance
- Uso do banco de dados no painel Supabase

## 🔄 Atualizações

Para atualizações futuras:
1. Faça as alterações no código
2. Teste localmente
3. Faça commit e push (deploy automático)
4. Ou rode `vercel --prod` para deploy manual