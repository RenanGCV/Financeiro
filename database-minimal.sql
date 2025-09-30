-- SOLUÇÃO RADICAL: Remove TUDO que pode causar "Database error saving new user"

-- 1. REMOVER TODOS OS TRIGGERS POSSÍVEIS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_for_new_user ON auth.users;

-- 2. REMOVER TODAS AS FUNÇÕES POSSÍVEIS
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 3. LIMPAR TODAS AS TABELAS
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS investimentos CASCADE;
DROP TABLE IF EXISTS despesas CASCADE;
DROP TABLE IF EXISTS receitas CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- 4. CRIAR TABELAS BÁSICAS SEM TRIGGERS (para testar)
CREATE TABLE public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT NOT NULL,
  data DATE NOT NULL,
  tag_id UUID,
  fixa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.despesas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT NOT NULL,
  data DATE NOT NULL,
  tag_id UUID,
  fixa BOOLEAN DEFAULT FALSE,
  parcelado BOOLEAN DEFAULT FALSE,
  total_parcelas INTEGER,
  parcela_atual INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.investimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  valor_inicial DECIMAL(10,2) NOT NULL CHECK (valor_inicial > 0),
  tipo VARCHAR(100) NOT NULL,
  data_inicio DATE NOT NULL,
  rendimento_percentual DECIMAL(5,2) DEFAULT 0,
  lucro_atual DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SEM RLS INICIALMENTE (para testar se funciona)
-- ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.investimentos ENABLE ROW LEVEL SECURITY;

-- 6. CONCEDER PERMISSÕES TOTAIS TEMPORARIAMENTE
GRANT ALL ON public.tags TO anon;
GRANT ALL ON public.receitas TO anon;
GRANT ALL ON public.despesas TO anon;
GRANT ALL ON public.investimentos TO anon;

GRANT ALL ON public.tags TO authenticated;
GRANT ALL ON public.receitas TO authenticated;
GRANT ALL ON public.despesas TO authenticated;
GRANT ALL ON public.investimentos TO authenticated;
