import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Receita, Despesa, Investimento } from '../types';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
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

export const Dashboard: React.FC = () => {
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

      // Buscar despesas processando parcelamentos corretamente
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

    // Buscar despesas não parceladas do mês
    const { data: despesasNaoParceladas } = await supabase
      .from('despesas')
      .select('*')
      .eq('user_id', user!.id)
      .eq('parcelado', false)
      .gte('data', inicioMes.toISOString().split('T')[0])
      .lte('data', fimMes.toISOString().split('T')[0]);

    // Buscar todas as despesas parceladas
    const { data: despesasParceladas } = await supabase
      .from('despesas')
      .select('*')
      .eq('user_id', user!.id)
      .eq('parcelado', true);

    const despesasFinais = [...(despesasNaoParceladas || [])];

    // Processar despesas parceladas para o mês atual
    despesasParceladas?.forEach(despesa => {
      if (despesa.total_parcelas && despesa.data) {
        const dataInicial = new Date(despesa.data);
        // Usar função utilitária para calcular valor da parcela
        const valorParcela = calculateParcelaValue(despesa.valor, despesa.total_parcelas);
        
        // Calcular qual parcela corresponde ao mês de referência usando função utilitária
        const mesesDiferenca = getMonthsDifference(dataInicial, mesReferencia);
        
        if (mesesDiferenca >= 0 && mesesDiferenca < despesa.total_parcelas) {
          const parcelaAtual = mesesDiferenca + 1;
          const dataParcela = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + mesesDiferenca, dataInicial.getDate());
          
          // Criar uma despesa virtual representando a parcela do mês
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
      // Reutilizar a lógica de processamento de despesas
      const despesasProcessadas = await processarDespesasDoMes(mesAtual);
      
      // Converter para o formato DespesaMes
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
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        {/* Seletor de Abas */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setAbaSelecionada('atual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              abaSelecionada === 'atual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Mês Atual
          </button>
          <button
            onClick={() => setAbaSelecionada('planejamento')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              abaSelecionada === 'planejamento'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Planejamento
          </button>
        </div>
      </div>

      {abaSelecionada === 'atual' ? (
        <>
          {/* Cards de resumo do mês atual */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Receitas do Mês</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalReceitas)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <TrendingDown className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Despesas do Mês</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalDespesas)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Saldo do Mês</h3>
                  <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(saldo)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <PiggyBank className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Investimentos</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(totalInvestimentos)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transações do mês atual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Receitas do Mês</h2>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {receitas.length > 0 ? (
                  <div className="space-y-3">
                    {receitas.map((receita) => (
                      <div key={receita.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{receita.descricao}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(receita.data).toLocaleDateString('pt-BR')}
                            {receita.fixa && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Fixa</span>}
                          </p>
                        </div>
                        <p className="font-semibold text-green-600">
                          +{formatCurrency(receita.valor)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhuma receita registrada neste mês</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Despesas do Mês</h2>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {despesas.length > 0 ? (
                  <div className="space-y-3">
                    {despesas.map((despesa) => (
                      <div key={despesa.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{despesa.descricao}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(despesa.data).toLocaleDateString('pt-BR')}
                            {despesa.fixa && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Fixa</span>}
                            {despesa.parcelado && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Parcelado</span>}
                          </p>
                        </div>
                        <p className="font-semibold text-red-600">
                          -{formatCurrency(despesa.valor)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhuma despesa registrada neste mês</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Aba de Planejamento por Mês */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Planejamento Mensal</h2>
              
              {/* Navegador de Mês */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => mudarMes('anterior')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                  {formatarMesAno(mesAtual)}
                </div>
                
                <button
                  onClick={() => mudarMes('proximo')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Resumo do Mês Selecionado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="text-sm font-medium text-red-700">Total de Despesas</h3>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalDespesasMes)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-700">Despesas Fixas</h3>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(despesasMes.filter(d => d.fixa).reduce((sum, d) => sum + d.valor, 0))}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="text-sm font-medium text-orange-700">Parcelas</h3>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(despesasMes.filter(d => d.parcelado).reduce((sum, d) => sum + d.valor, 0))}
                </p>
              </div>
            </div>

            {/* Lista de Despesas do Mês */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas Previstas</h3>
              {despesasMes.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {despesasMes.map((despesa) => (
                    <div key={despesa.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{despesa.descricao}</p>
                          {despesa.fixa && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Fixa</span>
                          )}
                          {despesa.parcelado && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              Parcela {despesa.parcela_atual}/{despesa.total_parcelas}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">
                            {new Date(despesa.data).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {despesa.categoria}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-red-600">
                        -{formatCurrency(despesa.valor)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhuma despesa prevista para este mês</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
