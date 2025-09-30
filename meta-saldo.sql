-- Criação da tabela para metas de saldo e simulações

-- Tabela para armazenar a meta de saldo do usuário
CREATE TABLE IF NOT EXISTS public.meta_saldo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor_meta DECIMAL(10,2) NOT NULL CHECK (valor_meta >= 0),
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para salvar simulações do usuário
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

-- Habilitar RLS
ALTER TABLE public.meta_saldo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para meta_saldo
CREATE POLICY "meta_saldo_select" ON public.meta_saldo 
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "meta_saldo_insert" ON public.meta_saldo 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "meta_saldo_update" ON public.meta_saldo 
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "meta_saldo_delete" ON public.meta_saldo 
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Políticas para simulacoes
CREATE POLICY "simulacoes_select" ON public.simulacoes 
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "simulacoes_insert" ON public.simulacoes 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "simulacoes_update" ON public.simulacoes 
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "simulacoes_delete" ON public.simulacoes 
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_meta_saldo_user_id ON public.meta_saldo(user_id);
CREATE INDEX IF NOT EXISTS idx_simulacoes_user_id ON public.simulacoes(user_id);

-- Conceder permissões
GRANT ALL ON public.meta_saldo TO authenticated;
GRANT ALL ON public.simulacoes TO authenticated;
