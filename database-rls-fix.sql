-- Correção para permitir criação de tags

-- 1. Habilitar RLS nas tabelas (agora que funcionou sem)
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investimentos ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas mais específicas para tags
DROP POLICY IF EXISTS "tags_policy" ON public.tags;

CREATE POLICY "tags_select" ON public.tags 
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "tags_insert" ON public.tags 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "tags_update" ON public.tags 
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "tags_delete" ON public.tags 
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- 3. Políticas para receitas
DROP POLICY IF EXISTS "receitas_policy" ON public.receitas;

CREATE POLICY "receitas_select" ON public.receitas 
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "receitas_insert" ON public.receitas 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "receitas_update" ON public.receitas 
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "receitas_delete" ON public.receitas 
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- 4. Políticas para despesas
DROP POLICY IF EXISTS "despesas_policy" ON public.despesas;

CREATE POLICY "despesas_select" ON public.despesas 
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "despesas_insert" ON public.despesas 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "despesas_update" ON public.despesas 
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "despesas_delete" ON public.despesas 
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- 5. Políticas para investimentos
DROP POLICY IF EXISTS "investimentos_policy" ON public.investimentos;

CREATE POLICY "investimentos_select" ON public.investimentos 
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "investimentos_insert" ON public.investimentos 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "investimentos_update" ON public.investimentos 
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "investimentos_delete" ON public.investimentos 
  FOR DELETE USING (auth.uid()::text = user_id::text);
