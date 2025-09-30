-- Script completo para deploy do banco de dados
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabelas principais
CREATE TABLE IF NOT EXISTS public.receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  tag_id UUID,
  fixa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.despesas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  categoria VARCHAR(100),
  tag_id UUID,
  fixa BOOLEAN DEFAULT FALSE,
  parcelado BOOLEAN DEFAULT FALSE,
  total_parcelas INTEGER CHECK (total_parcelas > 0),
  parcela_atual INTEGER CHECK (parcela_atual > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.investimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  valor_inicial DECIMAL(10,2) NOT NULL CHECK (valor_inicial > 0),
  valor_atual DECIMAL(10,2),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  descricao TEXT,
  rentabilidade_esperada DECIMAL(5,2),
  tag_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(50) NOT NULL,
  cor VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nome)
);

-- 2. Criar tabelas para meta de saldo
CREATE TABLE IF NOT EXISTS public.meta_saldo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor_meta DECIMAL(10,2) NOT NULL CHECK (valor_meta >= 0),
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.simulacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  valor_simulacao DECIMAL(10,2) NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
  saldo_resultante DECIMAL(10,2) NOT NULL,
  status_meta VARCHAR(20) CHECK (status_meta IN ('confortavel', 'proximo', 'excedido')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS em todas as tabelas
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_saldo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS para receitas
CREATE POLICY "receitas_select" ON public.receitas FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "receitas_insert" ON public.receitas FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "receitas_update" ON public.receitas FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "receitas_delete" ON public.receitas FOR DELETE USING (auth.uid()::text = user_id::text);

-- 5. Criar políticas RLS para despesas
CREATE POLICY "despesas_select" ON public.despesas FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "despesas_insert" ON public.despesas FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "despesas_update" ON public.despesas FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "despesas_delete" ON public.despesas FOR DELETE USING (auth.uid()::text = user_id::text);

-- 6. Criar políticas RLS para investimentos
CREATE POLICY "investimentos_select" ON public.investimentos FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "investimentos_insert" ON public.investimentos FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "investimentos_update" ON public.investimentos FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "investimentos_delete" ON public.investimentos FOR DELETE USING (auth.uid()::text = user_id::text);

-- 7. Criar políticas RLS para tags
CREATE POLICY "tags_select" ON public.tags FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "tags_insert" ON public.tags FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "tags_update" ON public.tags FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "tags_delete" ON public.tags FOR DELETE USING (auth.uid()::text = user_id::text);

-- 8. Criar políticas RLS para meta_saldo
CREATE POLICY "meta_saldo_select" ON public.meta_saldo FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "meta_saldo_insert" ON public.meta_saldo FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "meta_saldo_update" ON public.meta_saldo FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "meta_saldo_delete" ON public.meta_saldo FOR DELETE USING (auth.uid()::text = user_id::text);

-- 9. Criar políticas RLS para simulacoes
CREATE POLICY "simulacoes_select" ON public.simulacoes FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "simulacoes_insert" ON public.simulacoes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "simulacoes_update" ON public.simulacoes FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "simulacoes_delete" ON public.simulacoes FOR DELETE USING (auth.uid()::text = user_id::text);

-- 10. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON public.receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_data ON public.receitas(data);
CREATE INDEX IF NOT EXISTS idx_despesas_user_id ON public.despesas(user_id);
CREATE INDEX IF NOT EXISTS idx_despesas_data ON public.despesas(data);
CREATE INDEX IF NOT EXISTS idx_investimentos_user_id ON public.investimentos(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_saldo_user_id ON public.meta_saldo(user_id);
CREATE INDEX IF NOT EXISTS idx_simulacoes_user_id ON public.simulacoes(user_id);

-- 11. Conceder permissões
GRANT ALL ON public.receitas TO authenticated;
GRANT ALL ON public.despesas TO authenticated;
GRANT ALL ON public.investimentos TO authenticated;
GRANT ALL ON public.tags TO authenticated;
GRANT ALL ON public.meta_saldo TO authenticated;
GRANT ALL ON public.simulacoes TO authenticated;