-- SQL CORRIGIDO para resolver problemas de Database Error
-- Execute este arquivo se o database.sql original não funcionou

-- PRIMEIRO: Deletar tudo (se existir)
DROP TABLE IF EXISTS investimentos CASCADE;
DROP TABLE IF EXISTS despesas CASCADE;
DROP TABLE IF EXISTS receitas CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Criação das tabelas (SEM RLS inicialmente)

-- Tabela de tags
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nome, tipo)
);

-- Tabela de receitas
CREATE TABLE receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT NOT NULL,
  data DATE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE SET NULL,
  fixa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de despesas
CREATE TABLE despesas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT NOT NULL,
  data DATE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE SET NULL,
  fixa BOOLEAN DEFAULT FALSE,
  parcelado BOOLEAN DEFAULT FALSE,
  total_parcelas INTEGER CHECK (total_parcelas > 0),
  parcela_atual INTEGER CHECK (parcela_atual > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de investimentos
CREATE TABLE investimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  valor_inicial DECIMAL(10,2) NOT NULL CHECK (valor_inicial > 0),
  tipo VARCHAR(100) NOT NULL,
  data_inicio DATE NOT NULL,
  rendimento_percentual DECIMAL(5,2) DEFAULT 0,
  lucro_atual DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_receitas_user_id ON receitas(user_id);
CREATE INDEX idx_receitas_data ON receitas(data);
CREATE INDEX idx_despesas_user_id ON despesas(user_id);
CREATE INDEX idx_despesas_data ON despesas(data);
CREATE INDEX idx_investimentos_user_id ON investimentos(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- AGORA HABILITAR RLS (Row Level Security)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE investimentos ENABLE ROW LEVEL SECURITY;

-- Políticas para tags
CREATE POLICY "tags_select" ON tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tags_insert" ON tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tags_update" ON tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tags_delete" ON tags FOR DELETE USING (auth.uid() = user_id);

-- Políticas para receitas
CREATE POLICY "receitas_select" ON receitas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "receitas_insert" ON receitas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "receitas_update" ON receitas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "receitas_delete" ON receitas FOR DELETE USING (auth.uid() = user_id);

-- Políticas para despesas
CREATE POLICY "despesas_select" ON despesas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "despesas_insert" ON despesas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "despesas_update" ON despesas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "despesas_delete" ON despesas FOR DELETE USING (auth.uid() = user_id);

-- Políticas para investimentos
CREATE POLICY "investimentos_select" ON investimentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "investimentos_insert" ON investimentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "investimentos_update" ON investimentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "investimentos_delete" ON investimentos FOR DELETE USING (auth.uid() = user_id);
