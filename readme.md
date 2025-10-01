# Sistema de Gestão Financeira

Sistema futurista de gestão financeira com calendário inteligente, projeções automáticas e controle de receitas/despesas.

## 🚀 Deploy na Vercel

### Pré-requisitos
- Conta na [Vercel](https://vercel.com)
- Projeto no [Supabase](https://supabase.com)
- Node.js 18+ instalado

### Configuração das Variáveis de Ambiente

1. No dashboard da Vercel, vá para Settings > Environment Variables
2. Adicione as seguintes variáveis:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
NODE_ENV=production
VITE_APP_ENV=production
VITE_APP_SECURE=true
```

### Deploy Automático

1. Conecte seu repositório GitHub à Vercel
2. A Vercel detectará automaticamente que é um projeto Vite
3. O build será executado automaticamente com as otimizações configuradas

### Deploy Manual

```bash
# Clone o repositório
git clone <seu-repositorio>
cd financeiro

# Instale as dependências
npm ci

# Execute o build de produção
npm run build:prod

# Deploy para Vercel
npx vercel --prod
```

## 🛠️ Desenvolvimento Local

### Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd financeiro

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Execute o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run build:prod` - Build otimizado para produção
- `npm run preview` - Preview do build
- `npm run lint` - Verificação de código
- `npm run type-check` - Verificação de tipos TypeScript

## 🏗️ Arquitetura

### Frontend
- **React 18** com TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **Recharts** para gráficos

### Backend
- **Supabase** como Backend-as-a-Service
- **PostgreSQL** como banco de dados
- **Row Level Security (RLS)** para segurança

### Funcionalidades Principais

#### 📅 Calendário Financeiro
- Visualização mensal com projeções diárias
- Cores indicativas de saúde financeira
- Simulação de cenários futuros
- Integração com dias úteis para renda fixa

#### 💰 Gestão de Receitas
- Cadastro de receitas fixas e variáveis
- Configuração de dias úteis para renda fixa
- Sistema de tags e categorização
- Controle de parcelas

#### 💸 Controle de Despesas
- Registro de gastos com categorização
- Sistema de parcelas automático
- Tags personalizáveis
- Histórico completo

#### 📊 Projeções e Análises
- Cálculos automáticos de projeções
- Análise de tendências
- Percentuais de economia
- Visualizações gráficas

## 🔧 Configurações de Produção

### Otimizações Implementadas

- **Code Splitting**: Chunks separados por funcionalidade
- **Tree Shaking**: Remoção de código não utilizado
- **Minificação**: Compressão com Terser
- **Caching**: Headers de cache otimizados
- **Security Headers**: Proteções de segurança
- **Performance**: Lazy loading e otimizações

### Estrutura de Build

```
dist/
├── assets/
│   ├── vendor.[hash].js      # React, React DOM
│   ├── router.[hash].js      # React Router
│   ├── supabase.[hash].js    # Supabase Client
│   ├── ui.[hash].js          # Componentes UI
│   ├── charts.[hash].js      # Recharts
│   └── utils.[hash].js       # Utilitários
└── index.html
```

## 🔐 Segurança

- Headers de segurança configurados
- Proteção XSS
- Content Security Policy
- HTTPS obrigatório em produção
- Row Level Security no Supabase

## 🔄 CI/CD

O projeto está configurado para deploy automático na Vercel:
- Build automático em push para main
- Preview deploys em pull requests
- Otimizações de performance automáticas

## 📱 Responsividade

- Design responsivo para mobile e desktop
- Tema escuro futurista
- Componentes adaptativos
- Touch-friendly no mobile

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de build**: Verifique as variáveis de ambiente
2. **Conexão com Supabase**: Confirme URL e chave
3. **Erro 404**: Verifique configuração de rotas no vercel.json

### Logs

```bash
# Verificar logs da Vercel
npx vercel logs <deployment-url>

# Build local para debug
npm run build:prod
```

## 📈 Performance

- Lighthouse Score: 95+
- Core Web Vitals otimizados
- Lazy loading implementado
- Chunks otimizados para carregamento

---

**Desenvolvido com ❤️ usando React, TypeScript e Supabase**
