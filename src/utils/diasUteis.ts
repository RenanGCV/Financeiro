// Utilitários para cálculo de dias úteis
export const diasUteisUtils = {
  /**
   * Calcula o dia da semana (0 = domingo, 1 = segunda, ..., 6 = sábado)
   */
  getDiaSemana: (data: Date): number => {
    return data.getDay();
  },

  /**
   * Verifica se um dia é útil (segunda a sexta-feira)
   */
  isDiaUtil: (data: Date): boolean => {
    const diaSemana = data.getDay();
    return diaSemana >= 1 && diaSemana <= 5; // 1 = segunda, 5 = sexta
  },

  /**
   * Lista de feriados nacionais brasileiros (básicos)
   * Nota: Esta é uma implementação básica. Para produção, 
   * considere usar uma biblioteca especializada ou API de feriados
   */
  feriados2025: [
    '2025-01-01', // Ano Novo
    '2025-04-21', // Tiradentes
    '2025-05-01', // Dia do Trabalhador
    '2025-09-07', // Independência do Brasil
    '2025-10-12', // Nossa Senhora Aparecida
    '2025-11-02', // Finados
    '2025-11-15', // Proclamação da República
    '2025-12-25', // Natal
    // Adicione outros feriados conforme necessário
  ],

  /**
   * Verifica se uma data é feriado
   */
  isFeriado: (data: Date): boolean => {
    const dataStr = data.toISOString().split('T')[0];
    return diasUteisUtils.feriados2025.includes(dataStr);
  },

  /**
   * Verifica se uma data é realmente um dia útil (não é fim de semana nem feriado)
   */
  isDiaUtilReal: (data: Date): boolean => {
    return diasUteisUtils.isDiaUtil(data) && !diasUteisUtils.isFeriado(data);
  },

  /**
   * Calcula o Nº dia útil do mês para uma data específica
   */
  calcularNumeroDiaUtil: (data: Date): number => {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    let diaUtilCount = 0;
    
    // Itera do primeiro dia do mês até a data fornecida
    for (let dia = 1; dia <= data.getDate(); dia++) {
      const dataAtual = new Date(ano, mes, dia);
      if (diasUteisUtils.isDiaUtilReal(dataAtual)) {
        diaUtilCount++;
      }
    }
    
    return diaUtilCount;
  },

  /**
   * Encontra a data do Nº dia útil de um mês específico
   */
  obterDataDoNDiaUtil: (ano: number, mes: number, numeroDiaUtil: number): Date | null => {
    let diaUtilCount = 0;
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
    
    for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
      const dataAtual = new Date(ano, mes, dia);
      if (diasUteisUtils.isDiaUtilReal(dataAtual)) {
        diaUtilCount++;
        if (diaUtilCount === numeroDiaUtil) {
          return dataAtual;
        }
      }
    }
    
    return null; // Não foi possível encontrar o Nº dia útil
  },

  /**
   * Conta o total de dias úteis em um mês
   */
  contarDiasUteisNoMes: (ano: number, mes: number): number => {
    let diasUteis = 0;
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
    
    for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
      const dataAtual = new Date(ano, mes, dia);
      if (diasUteisUtils.isDiaUtilReal(dataAtual)) {
        diasUteis++;
      }
    }
    
    return diasUteis;
  },

  /**
   * Gera lista dos dias úteis de um mês com seus números
   */
  obterListaDiasUteisDoMes: (ano: number, mes: number): Array<{data: Date, numeroDiaUtil: number}> => {
    const diasUteis: Array<{data: Date, numeroDiaUtil: number}> = [];
    let numeroDiaUtil = 0;
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
    
    for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
      const dataAtual = new Date(ano, mes, dia);
      if (diasUteisUtils.isDiaUtilReal(dataAtual)) {
        numeroDiaUtil++;
        diasUteis.push({
          data: new Date(dataAtual),
          numeroDiaUtil
        });
      }
    }
    
    return diasUteis;
  },

  /**
   * Formata número do dia útil para exibição
   */
  formatarNumeroDiaUtil: (numero: number): string => {
    return `${numero}º dia útil`;
  }
};

export default diasUteisUtils;