# 🛠️ Soluções para o Erro "Erro ao salvar despesa"

## 🔍 **Problema Identificado**
O erro "Erro ao salvar despesa. Tente novamente." pode ter várias causas relacionadas à estrutura do banco de dados e validações.

## ✅ **Soluções Implementadas**

### **1. Correção do Campo `parcela_atual`**
- **Problema**: A tabela `despesas` tem o campo `parcela_atual` que não estava sendo preenchido
- **Solução**: Adicionado `parcela_atual: 1` quando `parcelado = true`

### **2. Validações Aprimoradas**
- ✅ Validação de valor numérico
- ✅ Validação de parcelas obrigatórias quando parcelado
- ✅ Tratamento de `tag_id` vazio como `null`

### **3. Tratamento de Erros Detalhado**
- 🔍 Log detalhado dos dados sendo inseridos
- 📝 Mensagens de erro específicas por tipo de problema
- 🎯 Identificação de constraints violadas

### **4. Correções nos Componentes**
- ✅ `TagSelect` corrigido com `tipo="despesa"`
- ✅ `CustomSwitch` corrigido com `label=""`

## 🗃️ **Script de Correção do Banco**

Execute o script `database-fix-despesas.sql` no Supabase para:
1. Verificar estrutura da tabela
2. Corrigir constraints problemáticas  
3. Limpar dados inconsistentes
4. Remover foreign keys problemáticas

## 🚀 **Como Testar a Correção**

### **Passo 1: Aplicar Correções do Banco**
```sql
-- Execute no Supabase SQL Editor
-- Ver arquivo: database-fix-despesas.sql
```

### **Passo 2: Testar Criação de Despesa**
1. Acesse a página de Despesas
2. Clique em "Nova Despesa"
3. Preencha os campos obrigatórios:
   - Descrição: "Teste"
   - Valor: "100"
   - Data: (data atual)
4. Teste cenários:
   - ✅ Despesa simples
   - ✅ Despesa fixa
   - ✅ Despesa parcelada
   - ✅ Despesa com tag

### **Passo 3: Verificar Console do Navegador**
- Abra F12 → Console
- Procure por logs detalhados
- Verifique erros específicos

## 🔍 **Diagnóstico de Problemas Comuns**

### **Erro de Constraint Check**
```
check constraint "despesas_total_parcelas_check"
```
**Solução**: Total de parcelas deve ser > 0 quando parcelado

### **Erro de Foreign Key**
```
foreign key constraint "despesas_tag_id_fkey"
```
**Solução**: Tag selecionada não existe ou foi deletada

### **Erro de Campo Obrigatório**
```
null value in column "campo" violates not-null constraint
```
**Solução**: Verificar se todos os campos obrigatórios estão sendo enviados

## 📊 **Log de Debug**

Com as correções implementadas, o console agora mostra:
```javascript
// Dados sendo inseridos:
{
  valor: 100,
  descricao: "Teste",
  data: "2025-09-30",
  categoria: null,
  tag_id: null,
  fixa: false,
  parcelado: false,
  total_parcelas: null,
  parcela_atual: null,
  user_id: "uuid-do-usuario"
}
```

## ⚡ **Resultado Esperado**

Após aplicar todas as correções:
- ✅ Criação de despesas funcionando
- ✅ Validações apropriadas
- ✅ Mensagens de erro claras
- ✅ Suporte completo a parcelas
- ✅ Interface responsiva mantida