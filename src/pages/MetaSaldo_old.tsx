import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Target, Calculator, Save, Trash2, TrendingUp, TrendingDown, History } from 'lucide-react';
import { SaldoGauge } from '../components/SaldoGauge';

interface IMetaSaldo {
  id: string;
  valor_meta: number;
  ativa: boolean;
}

interface Simulacao {
  id: string;
  nome: string;
  valor_simulacao: number;
  tipo: 'receita' | 'despesa';
  saldo_resultante: number;
  status_meta: 'confortavel' | 'proximo' | 'excedido';
  created_at: string;
}

interface DadosFinanceiros {
  totalReceitas: number;
  totalDespesas: number;
  despesasFixas: number;
  saldoAtual: number;
}

export const MetaSaldo: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<IMetaSaldo | null>(null);
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([]);
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceiros>({
    totalReceitas: 0,
    totalDespesas: 0,
    despesasFixas: 0,
    saldoAtual: 0
  });

  // Estados do formulário
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [valorMeta, setValorMeta] = useState('');
  const [simulacao, setSimulacao] = useState({
    valor: '',
    tipo: 'despesa' as 'receita' | 'despesa',
    nome: ''
  });
  const [mostrarSimulacao, setMostrarSimulacao] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDados();
    }
  }, [user]);

  const fetchDados = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchMeta(),
        fetchDadosFinanceiros(),
        fetchSimulacoes()
      ]);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    const { data, error } = await supabase
      .from('meta_saldo')
      .select('*')
      .eq('user_id', user?.id)
      .eq('ativa', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar meta:', error);
      return;
    }

    if (data) {
      setMeta(data);
      setValorMeta(data.valor_meta.toString());
    }
  };

  const fetchDadosFinanceiros = async () => {
    const [receitasResponse, despesasResponse] = await Promise.all([
      supabase
        .from('receitas')
        .select('valor, fixa')
        .eq('user_id', user?.id),
      supabase
        .from('despesas')
        .select('valor, fixa')
        .eq('user_id', user?.id)
    ]);

    const receitas = receitasResponse.data || [];
    const despesas = despesasResponse.data || [];

    const totalReceitas = receitas.reduce((sum, r) => sum + parseFloat(r.valor), 0);
    const totalDespesas = despesas.reduce((sum, d) => sum + parseFloat(d.valor), 0);
    const despesasFixas = despesas
      .filter(d => d.fixa)
      .reduce((sum, d) => sum + parseFloat(d.valor), 0);

    setDadosFinanceiros({
      totalReceitas,
      totalDespesas,
      despesasFixas,
      saldoAtual: totalReceitas - totalDespesas
    });
  };

  const fetchSimulacoes = async () => {
    const { data, error } = await supabase
      .from('simulacoes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro ao buscar simulações:', error);
      return;
    }

    setSimulacoes(data || []);
  };

  const salvarMeta = async () => {
    if (!user || !valorMeta) return;

    try {
      const novaMetaValor = parseFloat(valorMeta);

      if (meta) {
        // Atualizar meta existente
        const { error } = await supabase
          .from('meta_saldo')
          .update({ 
            valor_meta: novaMetaValor,
            updated_at: new Date().toISOString()
          })
          .eq('id', meta.id);

        if (error) throw error;
      } else {
        // Criar nova meta
        const { error } = await supabase
          .from('meta_saldo')
          .insert([{
            user_id: user.id,
            valor_meta: novaMetaValor,
            ativa: true
          }]);

        if (error) throw error;
      }

      await fetchMeta();
      setEditandoMeta(false);
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      alert('Erro ao salvar meta. Tente novamente.');
    }
  };

  const calcularSimulacao = () => {
    if (!simulacao.valor) return null;

    const valorSimulacao = parseFloat(simulacao.valor);
    const valorComSinal = simulacao.tipo === 'receita' ? valorSimulacao : -valorSimulacao;
    const saldoSimulado = dadosFinanceiros.saldoAtual + valorComSinal;

    return {
      saldoSimulado,
      valorComSinal
    };
  };

  const salvarSimulacao = async () => {
    if (!user || !simulacao.nome || !simulacao.valor || !meta) return;

    try {
      const resultado = calcularSimulacao();
      if (!resultado) return;

      const { saldoSimulado } = resultado;
      
      // Determinar status baseado na meta
      let status: 'confortavel' | 'proximo' | 'excedido';
      if (saldoSimulado < meta.valor_meta) {
        status = 'excedido';
      } else if (saldoSimulado <= meta.valor_meta * 1.1) {
        status = 'proximo';
      } else {
        status = 'confortavel';
      }

      const { error } = await supabase
        .from('simulacoes')
        .insert([{
          user_id: user.id,
          nome: simulacao.nome,
          valor_simulacao: parseFloat(simulacao.valor),
          tipo: simulacao.tipo,
          saldo_resultante: saldoSimulado,
          status_meta: status
        }]);

      if (error) throw error;

      // Limpar formulário
      setSimulacao({ valor: '', tipo: 'despesa', nome: '' });
      setMostrarSimulacao(false);
      
      await fetchSimulacoes();
    } catch (error) {
      console.error('Erro ao salvar simulação:', error);
      alert('Erro ao salvar simulação. Tente novamente.');
    }
  };

  const excluirSimulacao = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta simulação?')) return;

    try {
      const { error } = await supabase
        .from('simulacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSimulacoes();
    } catch (error) {
      console.error('Erro ao excluir simulação:', error);
      alert('Erro ao excluir simulação. Tente novamente.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-32 bg-gray-300 rounded"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  const simulacaoResultado = calcularSimulacao();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Target className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Meta de Saldo</h1>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Receitas Totais</h3>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(dadosFinanceiros.totalReceitas)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Despesas Totais</h3>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(dadosFinanceiros.totalDespesas)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Despesas Fixas</h3>
          <p className="text-xl font-bold text-orange-600">
            {formatCurrency(dadosFinanceiros.despesasFixas)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Saldo Atual</h3>
          <p className={`text-xl font-bold ${dadosFinanceiros.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(dadosFinanceiros.saldoAtual)}
          </p>
        </div>
      </div>

      {/* Configuração da Meta */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Configuração da Meta</h2>
          <button
            onClick={() => setEditandoMeta(!editandoMeta)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editandoMeta ? 'Cancelar' : (meta ? 'Editar Meta' : 'Definir Meta')}
          </button>
        </div>

        {editandoMeta ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor da Meta de Saldo Mínimo
              </label>
              <input
                type="number"
                step="0.01"
                value={valorMeta}
                onChange={(e) => setValorMeta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 500.00"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={salvarMeta}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Salvar Meta
              </button>
            </div>
          </div>
        ) : (
          <div>
            {meta ? (
              <p className="text-lg">
                Sua meta de saldo mínimo é: 
                <span className="font-bold text-blue-600 ml-2">
                  {formatCurrency(meta.valor_meta)}
                </span>
              </p>
            ) : (
              <p className="text-gray-500">
                Nenhuma meta definida. Clique em "Definir Meta" para começar.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Visualização do Saldo vs Meta */}
      {meta && (
        <SaldoGauge
          saldoAtual={dadosFinanceiros.saldoAtual}
          meta={meta.valor_meta}
          saldoSimulado={simulacaoResultado?.saldoSimulado}
        />
      )}

      {/* Simulador */}
      {meta && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <Calculator className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Simulador de Lançamentos</h2>
            </div>
            <button
              onClick={() => setMostrarSimulacao(!mostrarSimulacao)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {mostrarSimulacao ? 'Ocultar' : 'Nova Simulação'}
            </button>
          </div>

          {mostrarSimulacao && (
            <div className="space-y-4 mb-6 p-4 bg-purple-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Simulação
                  </label>
                  <input
                    type="text"
                    value={simulacao.nome}
                    onChange={(e) => setSimulacao({ ...simulacao, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Compra do carro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={simulacao.valor}
                    onChange={(e) => setSimulacao({ ...simulacao, valor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={simulacao.tipo}
                    onChange={(e) => setSimulacao({ ...simulacao, tipo: e.target.value as 'receita' | 'despesa' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="despesa">Despesa</option>
                    <option value="receita">Receita</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={salvarSimulacao}
                  disabled={!simulacao.nome || !simulacao.valor}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Simulação</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Histórico de Simulações */}
      {simulacoes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <History className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold">Simulações Salvas</h2>
          </div>
          <div className="space-y-3">
            {simulacoes.map((sim) => (
              <div
                key={sim.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {sim.tipo === 'receita' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium">{sim.nome}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {sim.tipo === 'receita' ? '+' : '-'}{formatCurrency(sim.valor_simulacao)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Saldo: {formatCurrency(sim.saldo_resultante)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(sim.created_at)}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      sim.status_meta === 'confortavel'
                        ? 'bg-green-100 text-green-800'
                        : sim.status_meta === 'proximo'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {sim.status_meta === 'confortavel' ? 'Confortável' :
                     sim.status_meta === 'proximo' ? 'Próximo' : 'Excedido'}
                  </span>
                  <button
                    onClick={() => excluirSimulacao(sim.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
