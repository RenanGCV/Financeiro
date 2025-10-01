import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Target,
  Zap,
  X
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface DadosFinanceiros {
  receitasFixas: number;
  despesasFixas: number;
  saldoInicial: number;
}

interface SimulacaoGasto {
  id: string;
  valor: number;
  descricao: string;
  dia: number;
}

interface DiaCalendario {
  dia: number;
  saldo: number;
  percentualEconomia: number;
  status: 'excelente' | 'bom' | 'atencao' | 'critico' | 'perigo';
  isToday: boolean;
  isCurrentMonth: boolean;
}

export const FuturisticCalendario: React.FC = () => {
  const { user } = useAuth();
  const [dados, setDados] = useState<DadosFinanceiros>({ receitasFixas: 0, despesasFixas: 0, saldoInicial: 0 });
  const [simulacoes, setSimulacoes] = useState<SimulacaoGasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diasCalendario, setDiasCalendario] = useState<DiaCalendario[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Estados do modal de simulação
  const [novaSimulacao, setNovaSimulacao] = useState({
    valor: '',
    descricao: '',
    dia: 1
  });

  useEffect(() => {
    if (user) {
      fetchDadosFinanceiros();
    }
  }, [user, mesAtual]);

  useEffect(() => {
    calcularCalendario();
  }, [dados, simulacoes, mesAtual]);

  const fetchDadosFinanceiros = async () => {
    try {
      setLoading(true);
      const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
      const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);

      const [receitasResult, despesasResult] = await Promise.all([
        supabase
          .from('receitas')
          .select('valor')
          .eq('user_id', user?.id)
          .eq('fixa', true)
          .gte('data', primeiroDia.toISOString().split('T')[0])
          .lte('data', ultimoDia.toISOString().split('T')[0]),
        supabase
          .from('despesas')
          .select('valor')
          .eq('user_id', user?.id)
          .eq('fixa', true)
          .gte('data', primeiroDia.toISOString().split('T')[0])
          .lte('data', ultimoDia.toISOString().split('T')[0])
      ]);

      if (receitasResult.error || despesasResult.error) {
        console.error('Erro ao buscar dados:', receitasResult.error || despesasResult.error);
        return;
      }

      const receitasFixas = (receitasResult.data || []).reduce((sum, r) => sum + r.valor, 0);
      const despesasFixas = (despesasResult.data || []).reduce((sum, d) => sum + d.valor, 0);
      const saldoInicial = receitasFixas - despesasFixas;

      setDados({
        receitasFixas,
        despesasFixas,
        saldoInicial
      });
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularCalendario = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const hoje = new Date();
    
    const dias: DiaCalendario[] = [];
    
    // Dias do mês anterior para completar a semana
    const primeiroDiaSemana = primeiroDia.getDay();
    for (let i = primeiroDiaSemana; i > 0; i--) {
      const dia = new Date(ano, mes, 1 - i);
      dias.push({
        dia: dia.getDate(),
        saldo: 0,
        percentualEconomia: 0,
        status: 'atencao',
        isToday: false,
        isCurrentMonth: false
      });
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const dataAtual = new Date(ano, mes, dia);
      const isToday = dataAtual.toDateString() === hoje.toDateString();
      
      // Calcular saldo até este dia
      const simulacoesDia = simulacoes
        .filter(s => s.dia <= dia)
        .reduce((sum, s) => sum + s.valor, 0);
      
      const saldoDia = dados.saldoInicial - simulacoesDia;
      const percentualEconomia = dados.receitasFixas > 0 
        ? (saldoDia / dados.receitasFixas) * 100 
        : 0;
      
      let status: DiaCalendario['status'] = 'bom';
      if (percentualEconomia >= 30) status = 'excelente';
      else if (percentualEconomia >= 0) status = 'bom';
      else if (percentualEconomia >= -30) status = 'atencao';
      else if (percentualEconomia >= -50) status = 'critico';
      else status = 'perigo';
      
      dias.push({
        dia,
        saldo: saldoDia,
        percentualEconomia,
        status,
        isToday,
        isCurrentMonth: true
      });
    }
    
    // Dias do próximo mês para completar a grade
    const totalDias = dias.length;
    const diasRestantes = 42 - totalDias; // 6 semanas * 7 dias
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push({
        dia: i,
        saldo: 0,
        percentualEconomia: 0,
        status: 'atencao',
        isToday: false,
        isCurrentMonth: false
      });
    }
    
    setDiasCalendario(dias);
  };

  const getStatusColor = (status: DiaCalendario['status'], isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'bg-gray-800/30 border-gray-700/50';
    
    switch (status) {
      case 'excelente':
        return 'bg-gradient-to-br from-yellow-400/90 to-yellow-500/90 border-yellow-400 shadow-yellow-400/20';
      case 'bom':
        return 'bg-gradient-to-br from-yellow-400/60 to-transparent border-yellow-400/60';
      case 'atencao':
        return 'bg-gradient-to-br from-transparent to-red-500/30 border-red-400/40';
      case 'critico':
        return 'bg-gradient-to-br from-red-500/60 to-red-600/60 border-red-500';
      case 'perigo':
        return 'bg-red-500 border-red-400 shadow-red-500/30';
      default:
        return 'bg-gray-800/50 border-gray-600';
    }
  };

  const adicionarSimulacao = () => {
    if (!novaSimulacao.valor || !novaSimulacao.descricao) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const valor = parseFloat(novaSimulacao.valor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    const novaSimulacaoObj: SimulacaoGasto = {
      id: Date.now().toString(),
      valor,
      descricao: novaSimulacao.descricao,
      dia: novaSimulacao.dia
    };

    setSimulacoes([...simulacoes, novaSimulacaoObj]);
    setNovaSimulacao({ valor: '', descricao: '', dia: 1 });
    setModalOpen(false);
  };

  const removerSimulacao = (id: string) => {
    setSimulacoes(simulacoes.filter(s => s.id !== id));
  };

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    const novoMes = new Date(mesAtual);
    if (direcao === 'anterior') {
      novoMes.setMonth(novoMes.getMonth() - 1);
    } else {
      novoMes.setMonth(novoMes.getMonth() + 1);
    }
    setMesAtual(novoMes);
  };

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const saldoFinalProjetado = dados.saldoInicial - simulacoes.reduce((sum, s) => sum + s.valor, 0);
  const percentualEconomiaFinal = dados.receitasFixas > 0 ? (saldoFinalProjetado / dados.receitasFixas) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-gold to-accent-orange rounded-2xl flex items-center justify-center animate-pulse-glow">
            <Calendar className="w-6 h-6 text-dark-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Calendário Financeiro</h1>
            <p className="text-text-muted">Projeção inteligente do seu orçamento mensal</p>
          </div>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="futuristic-button-primary flex items-center space-x-2"
        >
          <Calculator className="w-4 h-4" />
          <span>Simular Gasto</span>
        </button>
      </div>

      {/* Resumo Superior */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="metric-label">Receitas Fixas</div>
            <Plus className="w-5 h-5 text-green-400" />
          </div>
          <div className="metric-value text-green-400">
            {formatCurrency(dados.receitasFixas)}
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="metric-label">Despesas Fixas</div>
            <Minus className="w-5 h-5 text-red-400" />
          </div>
          <div className="metric-value text-red-400">
            {formatCurrency(dados.despesasFixas)}
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="metric-label">Saldo Projetado</div>
            {saldoFinalProjetado >= 0 ? 
              <TrendingUp className="w-5 h-5 text-green-400" /> : 
              <TrendingDown className="w-5 h-5 text-red-400" />
            }
          </div>
          <div className={`metric-value ${saldoFinalProjetado >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(saldoFinalProjetado)}
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <div className="metric-label">% Economia</div>
            <Target className={`w-5 h-5 ${percentualEconomiaFinal >= 30 ? 'text-yellow-400' : percentualEconomiaFinal >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
          <div className={`metric-value ${percentualEconomiaFinal >= 30 ? 'text-yellow-400' : percentualEconomiaFinal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {percentualEconomiaFinal.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Navegação do Calendário */}
      <div className="card-futuristic p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navegarMes('anterior')}
            className="futuristic-button-secondary p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold text-text-primary">
            {nomesMeses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </h2>
          
          <button
            onClick={() => navegarMes('proximo')}
            className="futuristic-button-secondary p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {diasSemana.map((dia) => (
            <div key={dia} className="text-center py-2 text-sm font-medium text-text-muted">
              {dia}
            </div>
          ))}
        </div>

        {/* Grade do calendário */}
        <div className="grid grid-cols-7 gap-2">
          {diasCalendario.map((diaInfo, index) => (
            <div
              key={index}
              className={`
                relative p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer
                ${getStatusColor(diaInfo.status, diaInfo.isCurrentMonth)}
                ${diaInfo.isToday ? 'ring-2 ring-accent-gold ring-offset-2 ring-offset-dark-primary' : ''}
                ${diaInfo.isCurrentMonth ? 'hover:scale-105 hover:shadow-lg' : 'opacity-50'}
                min-h-[80px] flex flex-col justify-between
              `}
            >
              <div className="text-sm font-medium">
                {diaInfo.dia}
              </div>
              
              {diaInfo.isCurrentMonth && (
                <div className="text-xs space-y-1">
                  <div className={`font-medium ${diaInfo.status === 'perigo' || diaInfo.status === 'critico' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(diaInfo.saldo)}
                  </div>
                  <div className={`text-xs ${diaInfo.status === 'perigo' || diaInfo.status === 'critico' ? 'text-white/80' : 'text-gray-700'}`}>
                    {diaInfo.percentualEconomia.toFixed(0)}%
                  </div>
                </div>
              )}
              
              {diaInfo.isToday && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-accent-gold rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Simulações Ativas */}
      {simulacoes.length > 0 && (
        <div className="card-futuristic p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-accent-orange" />
            <span>Simulações Ativas</span>
          </h3>
          <div className="space-y-3">
            {simulacoes.map((simulacao) => (
              <div key={simulacao.id} className="flex items-center justify-between p-3 bg-dark-secondary rounded-lg border border-dark-border">
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{simulacao.descricao}</div>
                  <div className="text-sm text-text-muted">
                    Dia {simulacao.dia} • {formatCurrency(simulacao.valor)}
                  </div>
                </div>
                <button
                  onClick={() => removerSimulacao(simulacao.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Simulação */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-futuristic max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">Simular Novo Gasto</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={novaSimulacao.descricao}
                  onChange={(e) => setNovaSimulacao({...novaSimulacao, descricao: e.target.value})}
                  placeholder="Ex: Jantar no restaurante"
                  className="futuristic-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Valor (R$)
                </label>
                <input
                  type="text"
                  value={novaSimulacao.valor}
                  onChange={(e) => setNovaSimulacao({...novaSimulacao, valor: e.target.value})}
                  placeholder="0,00"
                  className="futuristic-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Dia do Mês
                </label>
                <select
                  value={novaSimulacao.dia}
                  onChange={(e) => setNovaSimulacao({...novaSimulacao, dia: parseInt(e.target.value)})}
                  className="futuristic-select"
                >
                  {Array.from({ length: new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate() }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="futuristic-button-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarSimulacao}
                className="futuristic-button-primary flex-1"
              >
                Adicionar Simulação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};