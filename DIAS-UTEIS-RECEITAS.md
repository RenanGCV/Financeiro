# Implementação de Dias Úteis para Receitas Fixas

## 📋 Funcionalidade Implementada

Adicionada a capacidade de configurar receitas fixas para serem calculadas baseadas em **dias úteis** ao invés de datas fixas do calendário.

### 🎯 **Como Funciona:**

1. **Receitas Fixas Tradicionais**: Recebimento em uma data específica (ex: todo dia 15)
2. **Receitas por Dias Úteis**: Recebimento baseado no Nº dia útil do mês (ex: 5º dia útil)

### 💻 **Interface do Usuário:**

#### **No Formulário de Criação/Edição:**
- ✅ **Switch "Receita Fixa"**: Ativa funcionalidade de repetição mensal
- ✅ **Switch "Calcular por Dia Útil"**: Aparece quando receita fixa está ativa
- ✅ **Seletor de Dia Útil**: Escolhe qual dia útil (1º ao 23º dia útil do mês)

#### **Na Lista de Receitas:**
- 🏷️ **Badge "Fixa"**: Indica receitas que se repetem
- ⏰ **Badge "Xº dia útil"**: Mostra qual dia útil foi configurado
- 📅 **Informação adicional**: Exibe "Dia útil: Xº" nos detalhes

### 🛠 **Implementação Técnica:**

#### **Banco de Dados (Novos Campos):**
```sql
-- Campos adicionados à tabela receitas
usa_dia_util BOOLEAN DEFAULT FALSE
dia_util_numero INTEGER CHECK (dia_util_numero >= 1 AND dia_util_numero <= 23)
```

#### **Utilitários Criados:**
- `diasUteisUtils.ts`: Biblioteca completa para cálculos de dias úteis
- Funções principais:
  - `isDiaUtilReal()`: Verifica se é dia útil (seg-sex, excluindo feriados)
  - `obterDataDoNDiaUtil()`: Encontra a data do Nº dia útil
  - `contarDiasUteisNoMes()`: Conta total de dias úteis no mês
  - `formatarNumeroDiaUtil()`: Formata para exibição ("5º dia útil")

#### **Interface TypeScript:**
```typescript
interface Receita {
  // ... campos existentes
  usa_dia_util?: boolean;
  dia_util_numero?: number;
}
```

## 🚀 **Como Aplicar ao Banco:**

### **Passo 1: Executar Migração**
Execute o script no Supabase SQL Editor:
```sql
-- Arquivo: database-migration-dias-uteis.sql
ALTER TABLE public.receitas 
ADD COLUMN IF NOT EXISTS usa_dia_util BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dia_util_numero INTEGER CHECK (dia_util_numero >= 1 AND dia_util_numero <= 23);
```

### **Passo 2: Verificar Aplicação**
```sql
-- Verificar se os campos foram adicionados
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'receitas' 
AND column_name IN ('usa_dia_util', 'dia_util_numero');
```

## 🎯 **Casos de Uso:**

### **Exemplo 1: Salário no 5º Dia Útil**
- **Configuração**: 
  - Receita Fixa: ✅ Ativo
  - Calcular por Dia Útil: ✅ Ativo  
  - Dia Útil: 5º dia útil
- **Resultado**: O salário sempre cairá no 5º dia útil do mês

### **Exemplo 2: Freelance no 1º Dia Útil**
- **Configuração**:
  - Receita Fixa: ✅ Ativo
  - Calcular por Dia Útil: ✅ Ativo
  - Dia Útil: 1º dia útil
- **Resultado**: Pagamento sempre no primeiro dia útil do mês

### **Exemplo 3: Receita Tradicional (Data Fixa)**
- **Configuração**:
  - Receita Fixa: ✅ Ativo
  - Calcular por Dia Útil: ❌ Inativo
  - Data: 15/XX/XXXX
- **Resultado**: Sempre no dia 15, independente de ser útil ou não

## 🔄 **Integração com Calendário Financeiro:**

A funcionalidade se integra automaticamente com a página de **Calendário Financeiro**, onde:
- Receitas por dias úteis são calculadas automaticamente para cada mês
- As projeções consideram apenas dias úteis reais (sem fins de semana/feriados)
- Cores do calendário refletem o impacto das receitas nos dias corretos

## ⚠️ **Considerações:**

1. **Feriados**: Lista básica implementada para 2025, expandir conforme necessário
2. **Máximo 23 dias úteis**: Limite técnico baseado em meses com mais dias úteis
3. **Retrocompatibilidade**: Receitas existentes continuam funcionando normalmente
4. **Performance**: Cálculos otimizados para não impactar performance da aplicação

## 🎨 **UI/UX:**

- **Design futurístico**: Mantém a estética dark mode com acentos dourados
- **Feedback visual**: Badges coloridos indicam o tipo de configuração
- **Progressive disclosure**: Opções aparecem conforme necessário
- **Acessibilidade**: Descrições claras e ajuda contextual