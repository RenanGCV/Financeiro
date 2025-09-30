// Utilitários para formatação de moeda e cálculos financeiros

/**
 * Arredonda um valor para 2 casas decimais
 */
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};

/**
 * Formata um valor como moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  const roundedValue = roundToTwoDecimals(value);
  return roundedValue.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Calcula o valor de uma parcela arredondado
 */
export const calculateParcelaValue = (totalValue: number, totalParcelas: number): number => {
  return roundToTwoDecimals(totalValue / totalParcelas);
};

/**
 * Verifica se um valor está dentro de um mês específico
 */
export const isDateInMonth = (date: string, month: Date): boolean => {
  const itemDate = new Date(date);
  return itemDate.getMonth() === month.getMonth() && 
         itemDate.getFullYear() === month.getFullYear();
};

/**
 * Calcula quantos meses se passaram entre duas datas
 */
export const getMonthsDifference = (startDate: Date, endDate: Date): number => {
  return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
         (endDate.getMonth() - startDate.getMonth());
};

/**
 * Converte uma data para o formato YYYY-MM-DD sem problemas de timezone
 */
export const formatDateForInput = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Converte uma string de data para o formato de exibição brasileiro
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00'); // Força timezone local
  return date.toLocaleDateString('pt-BR');
};

/**
 * Valida se uma data não está no futuro (para transações)
 */
export const isValidTransactionDate = (dateString: string): boolean => {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Final do dia
  return date <= today;
};
