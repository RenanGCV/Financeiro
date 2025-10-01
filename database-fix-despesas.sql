-- Script para verificar e corrigir problemas na tabela de despesas

-- 1. Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'despesas' 
ORDER BY ordinal_position;

-- 2. Verificar constraints
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'despesas';

-- 3. Corrigir possíveis problemas nas constraints
-- Remover constraint muito restritiva se existir
ALTER TABLE public.despesas DROP CONSTRAINT IF EXISTS despesas_total_parcelas_check;
ALTER TABLE public.despesas DROP CONSTRAINT IF EXISTS despesas_parcela_atual_check;

-- Recriar constraints mais flexíveis
ALTER TABLE public.despesas ADD CONSTRAINT despesas_total_parcelas_check 
    CHECK (total_parcelas IS NULL OR total_parcelas > 0);

ALTER TABLE public.despesas ADD CONSTRAINT despesas_parcela_atual_check 
    CHECK (parcela_atual IS NULL OR parcela_atual > 0);

-- 4. Verificar se há algum problema com foreign keys na tag_id
-- Tornar a referência mais flexível (não obrigatória)
ALTER TABLE public.despesas DROP CONSTRAINT IF EXISTS despesas_tag_id_fkey;

-- 5. Verificar registros que podem estar causando problemas
SELECT id, valor, descricao, parcelado, total_parcelas, parcela_atual
FROM public.despesas 
WHERE (parcelado = true AND total_parcelas IS NULL) 
   OR (parcelado = true AND parcela_atual IS NULL)
   OR (parcelado = false AND (total_parcelas IS NOT NULL OR parcela_atual IS NOT NULL));

-- 6. Corrigir registros inconsistentes se existirem
UPDATE public.despesas 
SET parcela_atual = 1 
WHERE parcelado = true AND parcela_atual IS NULL;

UPDATE public.despesas 
SET total_parcelas = NULL, parcela_atual = NULL 
WHERE parcelado = false AND (total_parcelas IS NOT NULL OR parcela_atual IS NOT NULL);