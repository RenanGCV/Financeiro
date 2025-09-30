export interface User {
  id: string;
  email: string;
}

export interface Tag {
  id: string;
  user_id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
}

export interface Receita {
  id: string;
  user_id: string;
  valor: number;
  descricao: string;
  data: string;
  tag_id?: string;
  fixa: boolean;
  tag?: Tag;
}

export interface Despesa {
  id: string;
  user_id: string;
  valor: number;
  descricao: string;
  data: string;
  tag_id?: string;
  fixa: boolean;
  parcelado: boolean;
  total_parcelas?: number;
  parcela_atual?: number;
  tag?: Tag;
}

export interface Investimento {
  id: string;
  user_id: string;
  valor_inicial: number;
  tipo: string;
  data_inicio: string;
  rendimento_percentual: number;
  lucro_atual: number;
  meses_investido?: number;
}
