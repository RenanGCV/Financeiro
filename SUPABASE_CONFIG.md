# Configuração do Supabase

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha uma organização e dê um nome ao projeto
5. Defina uma senha para o banco de dados
6. Escolha a região (recomendo São Paulo - sa-east-1)
7. Clique em "Create new project"

## 2. Configurar Autenticação

1. No painel do Supabase, vá em **Authentication** > **Settings**
2. Em **Site URL**, adicione: `http://localhost:3000`
3. Em **Redirect URLs**, adicione: `http://localhost:3000/**`
4. Salve as configurações

## 3. Executar SQL para criar tabelas

1. Vá em **SQL Editor** no painel do Supabase
2. Copie todo o conteúdo do arquivo `database.sql`
3. Cole no editor e clique em "Run"
4. Verifique se todas as tabelas foram criadas em **Database** > **Tables**

## 4. Obter chaves da API

1. Vá em **Settings** > **API**
2. Copie:
   - **URL**: sua URL do projeto
   - **anon key**: chave pública para uso no frontend

## 5. Configurar variáveis de ambiente

1. Crie um arquivo `.env` na raiz do projeto
2. Adicione as variáveis:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

## 6. Testar conexão

1. Execute `npm run dev`
2. Acesse `http://localhost:3000`
3. Tente criar uma conta
4. Verifique se o usuário foi criado em **Authentication** > **Users**

## Estrutura das Tabelas Criadas

### `tags`
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key para auth.users)
- nome (VARCHAR)
- tipo ('receita' ou 'despesa')
- created_at (TIMESTAMP)

### `receitas`
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- valor (DECIMAL)
- descricao (TEXT)
- data (DATE)
- tag_id (UUID, Foreign Key para tags)
- fixa (BOOLEAN)
- created_at (TIMESTAMP)

### `despesas`
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- valor (DECIMAL)
- descricao (TEXT)
- data (DATE)
- tag_id (UUID, Foreign Key para tags)
- fixa (BOOLEAN)
- parcelado (BOOLEAN)
- total_parcelas (INTEGER)
- parcela_atual (INTEGER)
- created_at (TIMESTAMP)

### `investimentos`
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- valor_inicial (DECIMAL)
- tipo (VARCHAR)
- data_inicio (DATE)
- rendimento_percentual (DECIMAL)
- lucro_atual (DECIMAL)
- created_at (TIMESTAMP)

## Políticas de Segurança (RLS)

Todas as tabelas têm Row Level Security habilitado, garantindo que:
- Usuários só podem ver seus próprios dados
- Usuários só podem modificar seus próprios registros
- Inserções automáticas incluem o user_id do usuário logado

## Solução de Problemas

### Erro de CORS
- Verifique se a URL no arquivo `.env` está correta
- Certifique-se de que não há espaços extras nas variáveis

### Erro de autenticação
- Verifique se o RLS está habilitado
- Confirme se as políticas de segurança foram criadas
- Teste com um usuário recém-criado

### Tabelas não aparecem
- Execute o SQL novamente
- Verifique se não há erros no console do SQL Editor
- Confirme se você está logado com o usuário correto
