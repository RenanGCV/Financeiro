-- Script para adicionar a coluna categoria na tabela despesas (se necessário)

-- Verificar se a coluna categoria existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'despesas' 
        AND column_name = 'categoria'
    ) THEN
        -- Adicionar a coluna categoria se não existir
        ALTER TABLE public.despesas ADD COLUMN categoria VARCHAR(100);
        
        -- Comentário para documentação
        COMMENT ON COLUMN public.despesas.categoria IS 'Categoria da despesa (ex: Alimentação, Transporte, etc.)';
        
        RAISE NOTICE 'Coluna categoria adicionada com sucesso à tabela despesas';
    ELSE
        RAISE NOTICE 'Coluna categoria já existe na tabela despesas';
    END IF;
END
$$;