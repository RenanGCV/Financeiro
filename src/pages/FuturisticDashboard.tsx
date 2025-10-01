import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Receita, Despesa, Investimento } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  ArrowUpIcon,
  ArrowDownIcon,
  Target,
  Eye,
  Zap
} from 'lucide-react';
import { calculateParcelaValue, formatCurrency, getMonthsDifference } from '../utils/currency';

interface DespesaMes {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  fixa: boolean;
  parcelado: boolean;
  parcela_atual?: number;
  total_parcelas?: number;
  valor_parcela?: number;
}

export const FuturisticDashboard: React.FC = () => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [despesasMes, setDespesasMes] = useState<DespesaMes[]>([]);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [abaSelecionada, setAbaSelecionada] = useState<'atual' | 'planejamento'>('atual');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDadosAtuais();
      if (abaSelecionada === 'planejamento') {
        fetchDespesasMes();
      }
    }
  }, [user, abaSelecionada, mesAtual]);

  const fetchDadosAtuais = async () => {
    try {
      setLoading(true);
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      const [receitasResult, investimentosResult] = await Promise.all([
        supabase
          .from('receitas')
          .select('*')
          .eq('user_id', user!.id)
          .gte('data', inicioMes.toISOString().split('T')[0])
          .lte('data', fimMes.toISOString().split('T')[0])
          .order('data', { ascending: false }),
        supabase
          .from('investimentos')
          .select('*')
          .eq('user_id', user!.id)
          .order('data_inicio', { ascending: false })
          .limit(5),
      ]);

      const despesasProcessadas = await processarDespesasDoMes(hoje);

      if (receitasResult.data) setReceitas(receitasResult.data);
      setDespesas(despesasProcessadas);
      if (investimentosResult.data) setInvestimentos(investimentosResult.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const processarDespesasDoMes = async (mesReferencia: Date) => {
    const inicioMes = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth(), 1);
    const fimMes = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth() + 1, 0);

    const { data: despesasNaoParceladas } = await supabase
      .from('despesas')
      .select('*')
      .eq('user_id', user!.id)
      .eq('parcelado', false)
      .gte('data', inicioMes.toISOString().split('T')[0])
      .lte('data', fimMes.toISOString().split('T')[0]);

    const { data: despesasParceladas } = await supabase
      .from('despesas')
      .select('*')
      .eq('user_id', user!.id)
      .eq('parcelado', true);

    const despesasFinais = [...(despesasNaoParceladas || [])];

    despesasParceladas?.forEach(despesa => {
      if (despesa.total_parcelas && despesa.data) {
        const dataInicial = new Date(despesa.data);
        const valorParcela = calculateParcelaValue(despesa.valor, despesa.total_parcelas);
        const mesesDiferenca = getMonthsDifference(dataInicial, mesReferencia);
        
        if (mesesDiferenca >= 0 && mesesDiferenca < despesa.total_parcelas) {
          const parcelaAtual = mesesDiferenca + 1;
          const dataParcela = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + mesesDiferenca, dataInicial.getDate());
          
          despesasFinais.push({
            ...despesa,
            id: `${despesa.id}_parcela_${parcelaAtual}`,
            valor: valorParcela,
            data: dataParcela.toISOString().split('T')[0],
            descricao: `${despesa.descricao} (${parcelaAtual}/${despesa.total_parcelas})`,
            parcela_atual: parcelaAtual
          });
        }
      }
    });

    return despesasFinais.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  };

  const fetchDespesasMes = async () => {
    try {
      const despesasProcessadas = await processarDespesasDoMes(mesAtual);
      
      const despesasMesFormatadas: DespesaMes[] = despesasProcessadas.map(despesa => ({
        id: despesa.id,
        descricao: despesa.descricao,
        valor: despesa.valor,
        data: despesa.data,
        categoria: despesa.categoria || 'Geral',
        fixa: despesa.fixa || false,
        parcelado: despesa.parcelado || false,
        parcela_atual: despesa.parcela_atual,
        total_parcelas: despesa.total_parcelas,
        valor_parcela: despesa.parcelado ? despesa.valor : undefined
      }));

      setDespesasMes(despesasMesFormatadas);
    } catch (error) {
      console.error('Erro ao buscar despesas do mês:', error);
    }
  };

  const mudarMes = (direcao: 'anterior' | 'proximo') => {
    setMesAtual(prev => {
      const novoMes = new Date(prev);
      if (direcao === 'anterior') {
        novoMes.setMonth(prev.getMonth() - 1);
      } else {
        novoMes.setMonth(prev.getMonth() + 1);
      }
      return novoMes;
    });
  };

  const formatarMesAno = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const totalReceitas = receitas.reduce((sum, receita) => sum + receita.valor, 0);
  const totalDespesas = despesas.reduce((sum, despesa) => sum + despesa.valor, 0);
  const totalDespesasMes = despesasMes.reduce((sum, despesa) => sum + despesa.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  const totalInvestimentos = investimentos.reduce((sum, inv) => sum + inv.valor_inicial, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse-glow">
          <Zap className="w-8 h-8 text-accent-gold" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">Dashboard Financeiro</h1>
          <p className="text-text-muted">Visão completa das suas finanças em tempo real</p>
        </div>
        
        {/* Tab Selector */}
        <div className="flex bg-dark-card rounded-2xl p-2 mt-4 lg:mt-0 border border-dark-border">
          <button
            onClick={() => setAbaSelecionada('atual')}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
              abaSelecionada === 'atual'
                ? 'bg-gradient-to-r from-accent-gold to-accent-orange text-dark-primary shadow-glow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Mês Atual</span>
          </button>
          <button
            onClick={() => setAbaSelecionada('planejamento')}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
              abaSelecionada === 'planejamento'
                ? 'bg-gradient-to-r from-accent-gold to-accent-orange text-dark-primary shadow-glow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Planejamento</span>
          </button>
        </div>
      </div>

      {abaSelecionada === 'atual' ? (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="metric-card animate-fade-in">
              <div className="metric-label flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>Receitas do Mês</span>
              </div>
              <div className="metric-value">{formatCurrency(totalReceitas)}</div>
              <div className="metric-trend positive">
                <ArrowUpIcon className="w-3 h-3" />
                <span>+12.5% vs mês anterior</span>
              </div>
            </div>
            
            <div className="metric-card animate-fade-in" style={{animationDelay: '100ms'}}>
              <div className="metric-label flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span>Despesas do Mês</span>
              </div>
              <div className="metric-value">{formatCurrency(totalDespesas)}</div>
              <div className="metric-trend negative">
                <ArrowDownIcon className="w-3 h-3" />
                <span>+8.2% vs mês anterior</span>
              </div>
            </div>
            
            <div className="metric-card animate-fade-in" style={{animationDelay: '200ms'}}>
              <div className="metric-label flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-accent-gold" />
                <span>Saldo do Mês</span>
              </div>
              <div className={`metric-value ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(saldo)}
              </div>
              <div className={`metric-trend ${saldo >= 0 ? 'positive' : 'negative'}`}>
                {saldo >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                <span>{saldo >= 0 ? 'Positivo' : 'Negativo'}</span>
              </div>
            </div>
            
            <div className="metric-card animate-fade-in" style={{animationDelay: '300ms'}}>
              <div className="metric-label flex items-center space-x-2">
                <PiggyBank className="w-4 h-4 text-purple-400" />
                <span>Investimentos</span>
              </div>
              <div className="metric-value">{formatCurrency(totalInvestimentos)}</div>
              <div className="metric-trend positive">
                <ArrowUpIcon className="w-3 h-3" />
                <span>Portfolio ativo</span>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Receitas */}
            <div className="card-futuristic p-6 animate-fade-in" style={{animationDelay: '400ms'}}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Receitas Recentes</span>
                </h2>
                <span className="text-sm text-text-muted">{receitas.length} entradas</span>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {receitas.length > 0 ? (
                  receitas.map((receita) => (
                    <div key={receita.id} className="p-4 bg-dark-secondary rounded-xl border border-dark-border hover:border-green-400/30 transition-all group">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-text-primary group-hover:text-green-400 transition-colors">
                            {receita.descricao}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <p className="text-sm text-text-muted">
                              {new Date(receita.data).toLocaleDateString('pt-BR')}
                            </p>
                            {receita.fixa && (
                              <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded-lg">
                                Fixa
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400">
                            +{formatCurrency(receita.valor)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                    <p className="text-text-muted">Nenhuma receita registrada neste mês</p>
                  </div>
                )}
              </div>
            </div>

            {/* Despesas */}
            <div className="card-futuristic p-6 animate-fade-in" style={{animationDelay: '500ms'}}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span>Despesas Recentes</span>
                </h2>
                <span className="text-sm text-text-muted">{despesas.length} entradas</span>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {despesas.length > 0 ? (
                  despesas.map((despesa) => (
                    <div key={despesa.id} className="p-4 bg-dark-secondary rounded-xl border border-dark-border hover:border-red-400/30 transition-all group">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-text-primary group-hover:text-red-400 transition-colors">
                            {despesa.descricao}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <p className="text-sm text-text-muted">
                              {new Date(despesa.data).toLocaleDateString('pt-BR')}
                            </p>
                            {despesa.fixa && (
                              <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded-lg">
                                Fixa
                              </span>
                            )}
                            {despesa.parcelado && (
                              <span className="text-xs bg-accent-orange/20 text-accent-orange px-2 py-1 rounded-lg">
                                Parcelado
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-400">
                            -{formatCurrency(despesa.valor)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <TrendingDown className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                    <p className="text-text-muted">Nenhuma despesa registrada neste mês</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Planning View */}
          <div className="card-futuristic p-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <h2 className="text-2xl font-bold text-text-primary mb-4 lg:mb-0">
                Planejamento Mensal
              </h2>
              
              {/* Month Navigator */}
              <div className="flex items-center space-x-4 bg-dark-secondary rounded-2xl p-2 border border-dark-border">
                <button
                  onClick={() => mudarMes('anterior')}
                  className="p-3 text-text-muted hover:text-accent-gold hover:bg-dark-card rounded-xl transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-lg font-semibold text-text-primary min-w-[200px] text-center px-4">
                  {formatarMesAno(mesAtual)}
                </div>
                
                <button
                  onClick={() => mudarMes('proximo')}
                  className="p-3 text-text-muted hover:text-accent-gold hover:bg-dark-card rounded-xl transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="metric-card bg-red-500/10 border-red-500/20">
                <div className="metric-label text-red-400">Total de Despesas</div>
                <div className="metric-value text-red-400">{formatCurrency(totalDespesasMes)}</div>
              </div>
              <div className="metric-card bg-blue-500/10 border-blue-500/20">
                <div className="metric-label text-blue-400">Despesas Fixas</div>
                <div className="metric-value text-blue-400">
                  {formatCurrency(despesasMes.filter(d => d.fixa).reduce((sum, d) => sum + d.valor, 0))}
                </div>
              </div>
              <div className="metric-card bg-accent-orange/10 border-accent-orange/20">
                <div className="metric-label text-accent-orange">Parcelas</div>
                <div className="metric-value text-accent-orange">
                  {formatCurrency(despesasMes.filter(d => d.parcelado).reduce((sum, d) => sum + d.valor, 0))}
                </div>
              </div>
            </div>

            {/* Expense List */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-accent-gold" />
                <span>Despesas Previstas</span>
              </h3>
              
              {despesasMes.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {despesasMes.map((despesa) => (
                    <div key={despesa.id} className="p-4 bg-dark-secondary rounded-xl border border-dark-border hover:border-accent-gold/30 transition-all group">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <p className="font-medium text-text-primary group-hover:text-accent-gold transition-colors">
                              {despesa.descricao}
                            </p>
                            {despesa.fixa && (
                              <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded-lg">Fixa</span>
                            )}
                            {despesa.parcelado && (
                              <span className="text-xs bg-accent-orange/20 text-accent-orange px-2 py-1 rounded-lg">
                                Parcela {despesa.parcela_atual}/{despesa.total_parcelas}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <p className="text-sm text-text-muted">
                              {new Date(despesa.data).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-sm text-text-muted">{despesa.categoria}</p>
                          </div>
                        </div>
                        <p className="font-bold text-red-400">
                          -{formatCurrency(despesa.valor)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-text-muted">Nenhuma despesa prevista para este mês</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};