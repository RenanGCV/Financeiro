-- SOLUÇÃO COMPLETA para o erro "Database error saving new user"
-- Este erro acontece quando faltam triggers/funções automáticas do Supabase

-- 1. PRIMEIRO: Limpar tudo
DROP TABLE IF EXISTS investimentos CASCADE;
DROP TABLE IF EXISTS despesas CASCADE;
DROP TABLE IF EXISTS receitas CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Limpar políticas e funções que podem estar causando conflito
DROP POLICY IF EXISTS "tags_select" ON tags;
DROP POLICY IF EXISTS "tags_insert" ON tags;
DROP POLICY IF EXISTS "tags_update" ON tags;
DROP POLICY IF EXISTS "tags_delete" ON tags;
DROP POLICY IF EXISTS "receitas_select" ON receitas;
DROP POLICY IF EXISTS "receitas_insert" ON receitas;
DROP POLICY IF EXISTS "receitas_update" ON receitas;
DROP POLICY IF EXISTS "receitas_delete" ON receitas;
DROP POLICY IF EXISTS "despesas_select" ON despesas;
DROP POLICY IF EXISTS "despesas_insert" ON despesas;
DROP POLICY IF EXISTS "despesas_update" ON despesas;
DROP POLICY IF EXISTS "despesas_delete" ON despesas;
DROP POLICY IF EXISTS "investimentos_select" ON investimentos;
DROP POLICY IF EXISTS "investimentos_insert" ON investimentos;
DROP POLICY IF EXISTS "investimentos_update" ON investimentos;
DROP POLICY IF EXISTS "investimentos_delete" ON investimentos;

-- 2. CRIAR TABELA DE PERFIS (essencial para evitar o erro)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HABILITAR RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS para profiles
CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 5. CRIAR FUNÇÃO para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CRIAR TRIGGER para executar a função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. AGORA CRIAR AS TABELAS PRINCIPAIS
CREATE TABLE public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nome, tipo)
);

CREATE TABLE public.receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT NOT NULL,
  data DATE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE SET NULL,
  fixa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.despesas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT NOT NULL,
  data DATE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE SET NULL,
  fixa BOOLEAN DEFAULT FALSE,
  parcelado BOOLEAN DEFAULT FALSE,
  total_parcelas INTEGER CHECK (total_parcelas > 0),
  parcela_atual INTEGER CHECK (parcela_atual > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.investimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  valor_inicial DECIMAL(10,2) NOT NULL CHECK (valor_inicial > 0),
  tipo VARCHAR(100) NOT NULL,
  data_inicio DATE NOT NULL,
  rendimento_percentual DECIMAL(5,2) DEFAULT 0,
  lucro_atual DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. HABILITAR RLS em todas as tabelas
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investimentos ENABLE ROW LEVEL SECURITY;

-- 9. CRIAR POLÍTICAS SIMPLES E FUNCIONAIS
-- Tags
CREATE POLICY "tags_policy" ON public.tags
  FOR ALL USING (auth.uid() = user_id);

-- Receitas  
CREATE POLICY "receitas_policy" ON public.receitas
  FOR ALL USING (auth.uid() = user_id);

-- Despesas
CREATE POLICY "despesas_policy" ON public.despesas
  FOR ALL USING (auth.uid() = user_id);

-- Investimentos
CREATE POLICY "investimentos_policy" ON public.investimentos
  FOR ALL USING (auth.uid() = user_id);

-- 10. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON public.receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_data ON public.receitas(data);
CREATE INDEX IF NOT EXISTS idx_despesas_user_id ON public.despesas(user_id);
CREATE INDEX IF NOT EXISTS idx_despesas_data ON public.despesas(data);
CREATE INDEX IF NOT EXISTS idx_investimentos_user_id ON public.investimentos(user_id);
