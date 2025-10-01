-- Migração para adicionar campos de dias úteis às receitas
-- Execute este script no Supabase para adicionar os novos campos

-- Adicionar campos para suporte a dias úteis
ALTER TABLE public.receitas 
ADD COLUMN IF NOT EXISTS usa_dia_util BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dia_util_numero INTEGER CHECK (dia_util_numero >= 1 AND dia_util_numero <= 23);

-- Comentários para documentação
COMMENT ON COLUMN public.receitas.usa_dia_util IS 'Indica se a receita fixa deve ser calculada por dia útil';
COMMENT ON COLUMN public.receitas.dia_util_numero IS 'Número do dia útil do mês (1º, 2º, 3º, etc. dia útil)';