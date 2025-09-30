import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Investimento } from '../types';
import { TrendingUpIcon, DollarSignIcon } from 'lucide-react';

export const Investimentos: React.FC = () => {
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    valor_inicial: '',
    tipo: '',
    data_inicio: '',
    rendimento_percentual: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchInvestimentos();
    }
  }, [user]);

  const fetchInvestimentos = async () => {
    try {
      const { data, error } = await supabase
        .from('investimentos')
        .select('*')
        .eq('user_id', user!.id)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      if (data) {
        // Calcular lucro atual para cada investimento
        const investimentosComLucro = data.map(inv => {
          const mesesInvestido = calculateMonthsDifference(new Date(inv.data_inicio), new Date());
          const lucroCalculado = inv.valor_inicial * Math.pow(1 + (inv.rendimento_percentual / 100), mesesInvestido) - inv.valor_inicial;
          return {
            ...inv,
            lucro_atual: lucroCalculado,
            meses_investido: mesesInvestido
          };
        });
        setInvestimentos(investimentosComLucro);
      }
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthsDifference = (startDate: Date, endDate: Date): number => {
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    return Math.max(0, months);
  };

  const calculateProjection = (valorInicial: number, rendimento: number, meses: number): number => {
    return valorInicial * Math.pow(1 + (rendimento / 100), meses);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('investimentos')
        .insert([
          {
            user_id: user!.id,
            valor_inicial: parseFloat(formData.valor_inicial),
            tipo: formData.tipo,
            data_inicio: formData.data_inicio,
            rendimento_percentual: parseFloat(formData.rendimento_percentual),
            lucro_atual: 0,
          }
        ]);

      if (error) throw error;

      // Reset form
      setFormData({
        valor_inicial: '',
        tipo: '',
        data_inicio: '',
        rendimento_percentual: '',
      });
      setShowForm(false);
      fetchInvestimentos();
    } catch (error) {
      console.error('Erro ao salvar investimento:', error);
      alert('Erro ao salvar investimento');
    }
  };

  const deleteInvestimento = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
      try {
        const { error } = await supabase
          .from('investimentos')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchInvestimentos();
      } catch (error) {
        console.error('Erro ao excluir investimento:', error);
        alert('Erro ao excluir investimento');
      }
    }
  };

  const totalInvestido = investimentos.reduce((sum, inv) => sum + inv.valor_inicial, 0);
  const totalLucro = investimentos.reduce((sum, inv) => sum + inv.lucro_atual, 0);
  const valorAtual = totalInvestido + totalLucro;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Investimentos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <TrendingUpIcon className="w-4 h-4 mr-2" />
          Novo Investimento
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Investido</h3>
          <p className="text-2xl font-bold text-blue-600">
            R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Lucro Acumulado</h3>
          <p className={`text-2xl font-bold ${totalLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {totalLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Valor Atual</h3>
          <p className="text-2xl font-bold text-purple-600">
            R$ {valorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Adicionar Investimento</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Inicial (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.valor_inicial}
                onChange={(e) => setFormData({ ...formData, valor_inicial: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Investimento
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="">Selecione um tipo</option>
                <option value="Poupança">Poupança</option>
                <option value="CDB">CDB</option>
                <option value="Tesouro Direto">Tesouro Direto</option>
                <option value="Ações">Ações</option>
                <option value="Fundos de Investimento">Fundos de Investimento</option>
                <option value="Criptomoedas">Criptomoedas</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rendimento Mensal (%)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.rendimento_percentual}
                onChange={(e) => setFormData({ ...formData, rendimento_percentual: e.target.value })}
                placeholder="Ex: 0.5 para 0,5% ao mês"
              />
            </div>

            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Seus Investimentos</h2>
          {investimentos.length > 0 ? (
            <div className="space-y-4">
              {investimentos.map((investimento) => (
                <div key={investimento.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{investimento.tipo}</h3>
                      <p className="text-sm text-gray-500">
                        Desde {new Date(investimento.data_inicio).toLocaleDateString('pt-BR')}
                        {' • '}
                        {investimento.meses_investido || 0} meses
                      </p>
                    </div>
                    <button
                      onClick={() => deleteInvestimento(investimento.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Excluir
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Valor Inicial</p>
                      <p className="font-semibold text-blue-600">
                        R$ {investimento.valor_inicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Rendimento</p>
                      <p className="font-semibold">
                        {investimento.rendimento_percentual.toFixed(2)}% a.m.
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Lucro Atual</p>
                      <p className={`font-semibold ${investimento.lucro_atual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {investimento.lucro_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Valor Atual</p>
                      <p className="font-semibold text-purple-600">
                        R$ {(investimento.valor_inicial + investimento.lucro_atual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Projeções */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Projeções:</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">6 meses</p>
                        <p className="font-medium">
                          R$ {calculateProjection(
                            investimento.valor_inicial, 
                            investimento.rendimento_percentual, 
                            (investimento.meses_investido || 0) + 6
                          ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">1 ano</p>
                        <p className="font-medium">
                          R$ {calculateProjection(
                            investimento.valor_inicial, 
                            investimento.rendimento_percentual, 
                            (investimento.meses_investido || 0) + 12
                          ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">2 anos</p>
                        <p className="font-medium">
                          R$ {calculateProjection(
                            investimento.valor_inicial, 
                            investimento.rendimento_percentual, 
                            (investimento.meses_investido || 0) + 24
                          ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSignIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">Nenhum investimento cadastrado ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
