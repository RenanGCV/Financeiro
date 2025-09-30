# 💰 App de Gestão Financeira Pessoal

Um aplicativo completo para controle financeiro pessoal desenvolvido em React + TypeScript + Supabase.

## 🚀 Funcionalidades

- ✅ **Autenticação segura** com Supabase Auth
- 💰 **Gestão de receitas** com tags personalizáveis e receitas fixas
- 💸 **Controle de despesas** com sistema de parcelamento
- 📈 **Acompanhamento de investimentos** com cálculo de rendimentos
- 📊 **Relatórios visuais** com gráficos e exportação CSV
- 🔒 **Dados seguros** com Row Level Security (RLS)
- 📱 **Interface responsiva** com Tailwind CSS

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Roteamento**: React Router DOM
- **Gráficos**: Recharts
- **Ícones**: Lucide React

## 📋 Pré-requisitos

- Node.js 16+
- Conta no Supabase
- NPM ou Yarn

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd gestao-financeira
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Vá em **Settings > API** e copie:
   - URL do projeto
   - Chave pública (anon key)

### 4. Configure as variáveis de ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Configure o banco de dados

1. No painel do Supabase, vá em **SQL Editor**
2. Execute o script `database.sql` para criar as tabelas e políticas de segurança

### 6. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📚 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── contexts/           # Contextos React (Auth, etc)
├── pages/              # Páginas da aplicação
├── types/              # Definições de tipos TypeScript
├── lib/                # Configurações e utilitários
└── config/             # Configurações gerais
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas principais:

- **`tags`** - Tags personalizáveis para categorizar receitas/despesas
- **`receitas`** - Registro de receitas com suporte a receitas fixas
- **`despesas`** - Registro de despesas com sistema de parcelamento
- **`investimentos`** - Acompanhamento de investimentos e rendimentos

### Segurança:
- Row Level Security (RLS) habilitado
- Usuários só acessam seus próprios dados
- Políticas de segurança configuradas

## 🎯 Como usar

### 1. Cadastro/Login
- Crie uma conta ou faça login
- Confirme seu email se necessário

### 2. Dashboard
- Visualize resumo financeiro
- Acompanhe saldo, receitas e despesas
- Veja transações recentes

### 3. Receitas
- Cadastre receitas pontuais ou fixas
- Organize com tags personalizáveis
- Filtre por período ou categoria

### 4. Despesas
- Registre despesas à vista ou parceladas
- Sistema automático de parcelamento
- Controle de despesas fixas mensais

### 5. Investimentos
- Registre seus investimentos
- Acompanhe rendimentos
- Projete ganhos futuros

### 6. Relatórios
- Visualize gráficos de evolução
- Analise distribuição por categorias
- Exporte dados em CSV

## 🚀 Build para produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 📝 Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se encontrar problemas ou tiver dúvidas:

1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme se o banco de dados foi configurado corretamente
3. Verifique se o Supabase está funcionando normalmente

---

Desenvolvido com 💙 para controle financeiro pessoal
