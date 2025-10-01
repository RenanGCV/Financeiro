import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, PieChart, Calendar, Download, TrendingUp, TrendingDown, DollarSign, Zap, Filter, Eye } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface RelatorioDados {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitasPorMes: { mes: string; valor: number }[];
  despesasPorMes: { mes: string; valor: number }[];
  despesasPorCategoria: { categoria: string; valor: number }[];
  receitasFixas: number;
  despesasFixas: number;
}

export const FuturisticRelatorios: React.FC = () => {
  const { user } = useAuth();
  const [dados, setDados] = useState<RelatorioDados | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('6meses');
  const [tipoRelatorio, setTipoRelatorio] = useState<'resumo' | 'detalhado'>('resumo');

  useEffect(() => {
    if (user) {
      fetchDadosRelatorio();
    }
  }, [user, periodoSelecionado]);

  const fetchDadosRelatorio = async () => {
    try {
      setLoading(true);
      const hoje = new Date();
      let dataInicio: Date;

      switch (periodoSelecionado) {
        case '1mes':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          break;
        case '3meses':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
          break;
        case '6meses':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
          break;
        case '1ano':
          dataInicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), 1);
          break;
        default:
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
      }

      const [receitasResult, despesasResult] = await Promise.all([
        supabase
          .from('receitas')
          .select('*')
          .eq('user_id', user?.id)
          .gte('data', dataInicio.toISOString().split('T')[0])
          .order('data', { ascending: true }),
        supabase
          .from('despesas')
          .select('*')
          .eq('user_id', user?.id)
          .gte('data', dataInicio.toISOString().split('T')[0])
          .order('data', { ascending: true })
      ]);

      if (receitasResult.error || despesasResult.error) {
        console.error('Erro ao buscar dados:', receitasResult.error || despesasResult.error);
        return;
      }

      const receitas = receitasResult.data || [];
      const despesas = despesasResult.data || [];

      // Calcular totais
      const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
      const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);
      const saldo = totalReceitas - totalDespesas;

      // Agrupar por mês
      const receitasPorMes = agruparPorMes(receitas);
      const despesasPorMes = agruparPorMes(despesas);

      // Agrupar despesas por categoria
      const despesasPorCategoria = agruparPorCategoria(despesas);

      // Calcular receitas e despesas fixas
      const receitasFixas = receitas.filter(r => r.fixa).reduce((sum, r) => sum + r.valor, 0);
      const despesasFixas = despesas.filter(d => d.fixa).reduce((sum, d) => sum + d.valor, 0);

      setDados({
        totalReceitas,
        totalDespesas,
        saldo,
        receitasPorMes,
        despesasPorMes,
        despesasPorCategoria,
        receitasFixas,
        despesasFixas
      });
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const agruparPorMes = (transacoes: any[]) => {
    const agrupado: { [key: string]: number } = {};
    
    transacoes.forEach(transacao => {
      const data = new Date(transacao.data);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      agrupado[chave] = (agrupado[chave] || 0) + transacao.valor;
    });

    return Object.entries(agrupado).map(([mes, valor]) => ({
      mes: new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      valor
    }));
  };

  const agruparPorCategoria = (despesas: any[]) => {
    const agrupado: { [key: string]: number } = {};
    
    despesas.forEach(despesa => {
      const categoria = despesa.categoria || 'Sem categoria';
      agrupado[categoria] = (agrupado[categoria] || 0) + despesa.valor;
    });

    return Object.entries(agrupado)
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor);
  };

  const exportarRelatorio = () => {
    if (!dados) return;

    const relatorio = {
      periodo: periodoSelecionado,
      dataGeracao: new Date().toISOString(),
      resumo: {
        totalReceitas: dados.totalReceitas,
        totalDespesas: dados.totalDespesas,
        saldo: dados.saldo,
        receitasFixas: dados.receitasFixas,
        despesasFixas: dados.despesasFixas
      },
      detalhes: {
        receitasPorMes: dados.receitasPorMes,
        despesasPorMes: dados.despesasPorMes,
        despesasPorCategoria: dados.despesasPorCategoria
      }
    };

    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${periodoSelecionado}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse-glow">
          <Zap className="w-8 h-8 text-accent-gold" />
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
        <p className="text-text-muted">Não foi possível carregar os dados do relatório</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2 flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Relatórios</span>
          </h1>
          <p className="text-text-muted">Análise detalhada das suas finanças</p>
        </div>
        
        <button
          onClick={exportarRelatorio}
          className="futuristic-button-primary mt-4 lg:mt-0"
        >
          <Download className="w-5 h-5 mr-2" />
          Exportar Relatório
        </button>
      </div>

      {/* Controls */}
      <div className="card-futuristic p-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Period Filter */}
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-text-muted" />
            <select
              value={periodoSelecionado}
              onChange={(e) => setPeriodoSelecionado(e.target.value)}
              className="futuristic-select"
            >
              <option value="1mes">Último mês</option>
              <option value="3meses">Últimos 3 meses</option>
              <option value="6meses">Últimos 6 meses</option>
              <option value="1ano">Último ano</option>
            </select>
          </div>
          
          {/* Report Type Filter */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-text-muted" />
            <select
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value as 'resumo' | 'detalhado')}
              className="futuristic-select"
            >
              <option value="resumo">Resumo</option>
              <option value="detalhado">Detalhado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card animate-fade-in">
          <div className="metric-label flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span>Total de Receitas</span>
          </div>
          <div className="metric-value">{formatCurrency(dados.totalReceitas)}</div>
          <div className="metric-trend positive">
            <span>Período selecionado</span>
          </div>
        </div>
        
        <div className="metric-card animate-fade-in" style={{animationDelay: '100ms'}}>
          <div className="metric-label flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span>Total de Despesas</span>
          </div>
          <div className="metric-value">{formatCurrency(dados.totalDespesas)}</div>
          <div className="metric-trend negative">
            <span>Período selecionado</span>
          </div>
        </div>
        
        <div className="metric-card animate-fade-in" style={{animationDelay: '200ms'}}>
          <div className="metric-label flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-accent-gold" />
            <span>Saldo Total</span>
          </div>
          <div className={`metric-value ${dados.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(dados.saldo)}
          </div>
          <div className={`metric-trend ${dados.saldo >= 0 ? 'positive' : 'negative'}`}>
            <span>{dados.saldo >= 0 ? 'Positivo' : 'Negativo'}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends */}
        <div className="card-futuristic p-6 animate-fade-in" style={{animationDelay: '300ms'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-accent-gold" />
              <span>Evolução Mensal</span>
            </h2>
          </div>
          
          <div className="space-y-4">
            {dados.receitasPorMes.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-secondary rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-text-secondary">{item.mes}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-400">+{formatCurrency(item.valor)}</p>
                  <p className="text-sm text-red-400">
                    -{formatCurrency(dados.despesasPorMes.find(d => d.mes === item.mes)?.valor || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="card-futuristic p-6 animate-fade-in" style={{animationDelay: '400ms'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-accent-gold" />
              <span>Despesas por Categoria</span>
            </h2>
          </div>
          
          <div className="space-y-3">
            {dados.despesasPorCategoria.slice(0, 8).map((item, index) => {
              const porcentagem = (item.valor / dados.totalDespesas) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">{item.categoria}</span>
                    <span className="text-text-primary font-medium">{formatCurrency(item.valor)}</span>
                  </div>
                  <div className="w-full bg-dark-secondary rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-accent-gold to-accent-orange"
                      style={{ width: `${porcentagem}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-text-muted">{porcentagem.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed vs Variable */}
      {tipoRelatorio === 'detalhado' && (
        <div className="card-futuristic p-6 animate-fade-in" style={{animationDelay: '500ms'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary flex items-center space-x-2">
              <Eye className="w-5 h-5 text-accent-gold" />
              <span>Análise Detalhada - Fixas vs Variáveis</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-primary">Receitas</h3>
              <div className="p-4 bg-dark-secondary rounded-xl border border-dark-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-secondary">Receitas Fixas</span>
                  <span className="text-green-400 font-medium">{formatCurrency(dados.receitasFixas)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Receitas Variáveis</span>
                  <span className="text-green-400 font-medium">{formatCurrency(dados.totalReceitas - dados.receitasFixas)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-primary">Despesas</h3>
              <div className="p-4 bg-dark-secondary rounded-xl border border-dark-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-secondary">Despesas Fixas</span>
                  <span className="text-red-400 font-medium">{formatCurrency(dados.despesasFixas)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Despesas Variáveis</span>
                  <span className="text-red-400 font-medium">{formatCurrency(dados.totalDespesas - dados.despesasFixas)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-accent-gold/10 rounded-xl border border-accent-gold/20">
            <h4 className="font-medium text-text-primary mb-2">Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-muted">
              <p>
                • {((dados.receitasFixas / dados.totalReceitas) * 100).toFixed(1)}% das suas receitas são fixas
              </p>
              <p>
                • {((dados.despesasFixas / dados.totalDespesas) * 100).toFixed(1)}% das suas despesas são fixas
              </p>
              <p>
                • Saldo fixo mensal: {formatCurrency(dados.receitasFixas - dados.despesasFixas)}
              </p>
              <p>
                • Margem para gastos variáveis: {formatCurrency((dados.totalReceitas - dados.receitasFixas) - (dados.totalDespesas - dados.despesasFixas))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};