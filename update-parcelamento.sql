-- Script para adicionar campos de parcelamento na tabela despesas (caso não existam)

-- Verificar e adicionar campos de parcelamento
DO $$ 
BEGIN
    -- Adicionar campo parcelado se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'despesas' 
        AND column_name = 'parcelado'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.despesas ADD COLUMN parcelado BOOLEAN DEFAULT FALSE;
    END IF;

    -- Adicionar campo total_parcelas se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'despesas' 
        AND column_name = 'total_parcelas'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.despesas ADD COLUMN total_parcelas INTEGER CHECK (total_parcelas > 0);
    END IF;

    -- Adicionar campo parcela_atual se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'despesas' 
        AND column_name = 'parcela_atual'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.despesas ADD COLUMN parcela_atual INTEGER CHECK (parcela_atual > 0);
    END IF;
END $$;

-- Atualizar despesas existentes para ter parcelado = false caso seja NULL
UPDATE public.despesas SET parcelado = FALSE WHERE parcelado IS NULL;
