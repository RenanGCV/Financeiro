# Projeto: App de Gestão Financeira Pessoal

Quero desenvolver um aplicativo em **React** integrado ao **Supabase** para controle financeiro pessoal.  
O app deve ter autenticação de usuários (login/cadastro com e-mail e senha via Supabase Auth), e cada usuário só deve visualizar seus próprios dados.  

## Funcionalidades principais

### 1. Autenticação
- Login e cadastro de usuários usando Supabase Auth.
- Proteção das rotas, acessando apenas após login.
- Logout.

### 2. Receitas
- Cadastro de receitas com: valor, descrição, data e **tags personalizáveis**.
- Opção de marcar como **receita fixa** (ex: salário mensal).
- Filtragem de receitas por tags.

### 3. Despesas
- Cadastro de despesas com: valor, descrição, data e **tags personalizáveis**.
- Opção de marcar como **despesa fixa**.
- Cadastro de **despesas parceladas**: usuário informa valor total e número de parcelas, o sistema gera automaticamente as parcelas.
- Filtragem de despesas por tags.

### 4. Investimentos
- Registro de investimentos com: valor inicial, tipo (renda fixa, ações, etc) e data de início.
- Cálculo do **lucro acumulado**.
- Projeção de ganhos futuros com base em um percentual de crescimento mensal informado pelo usuário.

### 5. Relatórios
- Relatórios de receitas, despesas e saldo em períodos **semanal, mensal e anual**.
- Gráficos básicos (pizza para distribuição por tags/categorias e linha para evolução de saldo/investimentos).
- Exportação em **CSV**.

## Banco de Dados (Supabase)
Estrutura inicial das tabelas (além de `users` do próprio Supabase Auth):

- **tags**  
  - id, user_id, nome, tipo ("receita" ou "despesa")  

- **receitas**  
  - id, user_id, valor, descricao, data, tag_id, fixa (boolean)  

- **despesas**  
  - id, user_id, valor, descricao, data, tag_id, fixa (boolean), parcelado (boolean), total_parcelas, parcela_atual  

- **investimentos**  
  - id, user_id, valor_inicial, tipo, data_inicio, rendimento_percentual, lucro_atual  

## Observações
- Interface simples e responsiva (usar Tailwind CSS).
- Código limpo e bem organizado.
- Persistência de dados sempre no Supabase.
- Esse sistema será para uso pessoal, mas deve permitir login em qualquer dispositivo.
