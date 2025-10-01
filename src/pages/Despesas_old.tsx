import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, CreditCard, Calendar, FileText, Package } from 'lucide-react';
import { TagSelect } from '../components/TagSelect';
import { CustomSwitch } from '../components/CustomSwitch';
import { DatePicker } from '../components/DatePicker';
import { formatDateForInput, formatDateForDisplay } from '../utils/currency';

interface Despesa {
  id: string;
  valor: number;
  descricao: string;
  data: string;
  tag_id?: string;
  fixa: boolean;
  parcelado: boolean;
  total_parcelas?: number;
  parcela_atual?: number;
  created_at: string;
}

export const Despesas: React.FC = () => {
  const { user } = useAuth();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [formData, setFormData] = useState({
    valor: '',
    descricao: '',
    data: formatDateForInput(),
    tag_id: '',
    fixa: false,
    parcelado: false,
    total_parcelas: '',
    parcela_atual: ''
  });

  useEffect(() => {
    if (user) {
      fetchDespesas();
    }
  }, [user]);

  const fetchDespesas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .eq('user_id', user?.id)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar despesas:', error);
        return;
      }

      setDespesas(data || []);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (despesa?: Despesa) => {
    if (despesa) {
      setEditingDespesa(despesa);
      setFormData({
        valor: despesa.valor.toString(),
        descricao: despesa.descricao,
        data: despesa.data,
        tag_id: despesa.tag_id || '',
        fixa: despesa.fixa,
        parcelado: despesa.parcelado,
        total_parcelas: despesa.total_parcelas?.toString() || '',
        parcela_atual: despesa.parcela_atual?.toString() || ''
      });
    } else {
      setEditingDespesa(null);
      setFormData({
        valor: '',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        tag_id: '',
        fixa: false,
        parcelado: false,
        total_parcelas: '',
        parcela_atual: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDespesa(null);
    setFormData({
      valor: '',
      descricao: '',
      data: formatDateForInput(),
      tag_id: '',
      fixa: false,
      parcelado: false,
      total_parcelas: '',
      parcela_atual: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const despesaData = {
        valor: parseFloat(formData.valor),
        descricao: formData.descricao,
        data: formData.data,
        tag_id: formData.tag_id || null,
        fixa: formData.fixa,
        parcelado: formData.parcelado,
        total_parcelas: formData.parcelado && formData.total_parcelas ? parseInt(formData.total_parcelas) : null,
        parcela_atual: formData.parcelado && formData.parcela_atual ? parseInt(formData.parcela_atual) : null,
        user_id: user.id
      };

      if (editingDespesa) {
        const { error } = await supabase
          .from('despesas')
          .update(despesaData)
          .eq('id', editingDespesa.id);

        if (error) {
          console.error('Erro ao atualizar despesa:', error);
          alert('Erro ao atualizar despesa');
          return;
        }
      } else {
        const { error } = await supabase
          .from('despesas')
          .insert([despesaData]);

        if (error) {
          console.error('Erro ao criar despesa:', error);
          alert('Erro ao criar despesa');
          return;
        }
      }

      fetchDespesas();
      closeModal();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar despesa');
    }
  };

  const deleteDespesa = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar despesa:', error);
        alert('Erro ao deletar despesa');
        return;
      }

      fetchDespesas();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar despesa');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-12 bg-gray-300 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalDespesas = despesas.reduce((sum, despesa) => sum + despesa.valor, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Despesas</h1>
          <p className="text-lg text-red-600 font-semibold mt-2">
            Total: {formatCurrency(totalDespesas)}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Despesa</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {despesas.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma despesa encontrada</h3>
            <p className="text-gray-500">Comece adicionando sua primeira despesa!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parcelas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {despesas.map((despesa) => (
                  <tr key={despesa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {despesa.descricao}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-red-600">
                        {formatCurrency(despesa.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDateForDisplay(despesa.data)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {despesa.fixa && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Fixa
                          </span>
                        )}
                        {despesa.parcelado && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Parcelada
                          </span>
                        )}
                        {!despesa.fixa && !despesa.parcelado && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Variável
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {despesa.parcelado && despesa.total_parcelas ? (
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {despesa.parcela_atual || 1}/{despesa.total_parcelas}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(despesa)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDespesa(despesa.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Supermercado, Conta de luz..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>

              <DatePicker
                label="Data"
                value={formData.data}
                onChange={(date) => setFormData({ ...formData, data: date })}
                required
                maxDate={formatDateForInput()}
                placeholder="Selecione a data da despesa"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag
                </label>
                <TagSelect
                  value={formData.tag_id}
                  onChange={(tagId) => setFormData({ ...formData, tag_id: tagId || '' })}
                  tipo="despesa"
                  placeholder="Selecione uma tag (opcional)"
                />
              </div>

              <div className="space-y-3">
                <CustomSwitch
                  checked={formData.fixa}
                  onChange={(checked) => setFormData({ ...formData, fixa: checked })}
                  label="Despesa fixa (recorrente)"
                />

                <CustomSwitch
                  checked={formData.parcelado}
                  onChange={(checked) => setFormData({ 
                    ...formData, 
                    parcelado: checked,
                    total_parcelas: checked ? formData.total_parcelas : '',
                    parcela_atual: checked ? formData.parcela_atual : ''
                  })}
                  label="Despesa parcelada"
                />
              </div>

              {formData.parcelado && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total de Parcelas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.total_parcelas}
                      onChange={(e) => setFormData({ ...formData, total_parcelas: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ex: 12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parcela Atual
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={formData.total_parcelas || undefined}
                      value={formData.parcela_atual}
                      onChange={(e) => setFormData({ ...formData, parcela_atual: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ex: 1"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  {editingDespesa ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
