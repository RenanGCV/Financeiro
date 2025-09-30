import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, DollarSign, Calendar, FileText } from 'lucide-react';
import { TagSelect } from '../components/TagSelect';
import { CustomSwitch } from '../components/CustomSwitch';
import { DatePicker } from '../components/DatePicker';
import { formatDateForInput, formatDateForDisplay } from '../utils/currency';

interface Receita {
  id: string;
  valor: number;
  descricao: string;
  data: string;
  tag_id?: string;
  fixa: boolean;
  created_at: string;
}

export const Receitas: React.FC = () => {
  const { user } = useAuth();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null);
  const [formData, setFormData] = useState({
    valor: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    tag_id: '',
    fixa: false
  });

  useEffect(() => {
    if (user) {
      fetchReceitas();
    }
  }, [user]);

  const fetchReceitas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .eq('user_id', user?.id)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar receitas:', error);
        return;
      }

      setReceitas(data || []);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (receita?: Receita) => {
    if (receita) {
      setEditingReceita(receita);
      setFormData({
        valor: receita.valor.toString(),
        descricao: receita.descricao,
        data: receita.data,
        tag_id: receita.tag_id || '',
        fixa: receita.fixa
      });
    } else {
      setEditingReceita(null);
      setFormData({
        valor: '',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        tag_id: '',
        fixa: false
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReceita(null);
    setFormData({
      valor: '',
      descricao: '',
      data: new Date().toISOString().split('T')[0],
      tag_id: '',
      fixa: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const receitaData = {
        valor: parseFloat(formData.valor),
        descricao: formData.descricao,
        data: formData.data,
        tag_id: formData.tag_id || null,
        fixa: formData.fixa,
        user_id: user.id
      };

      if (editingReceita) {
        const { error } = await supabase
          .from('receitas')
          .update(receitaData)
          .eq('id', editingReceita.id);

        if (error) {
          console.error('Erro ao atualizar receita:', error);
          alert('Erro ao atualizar receita');
          return;
        }
      } else {
        const { error } = await supabase
          .from('receitas')
          .insert([receitaData]);

        if (error) {
          console.error('Erro ao criar receita:', error);
          alert('Erro ao criar receita');
          return;
        }
      }

      fetchReceitas();
      closeModal();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar receita');
    }
  };

  const deleteReceita = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;

    try {
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar receita:', error);
        alert('Erro ao deletar receita');
        return;
      }

      fetchReceitas();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar receita');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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

  const totalReceitas = receitas.reduce((sum, receita) => sum + receita.valor, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receitas</h1>
          <p className="text-lg text-green-600 font-semibold mt-2">
            Total: {formatCurrency(totalReceitas)}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Receita</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {receitas.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma receita encontrada</h3>
            <p className="text-gray-500">Comece adicionando sua primeira receita!</p>
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
                    Fixa
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receitas.map((receita) => (
                  <tr key={receita.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {receita.descricao}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(receita.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDate(receita.data)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {receita.fixa ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Fixa
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Variável
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(receita)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReceita(receita.id)}
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
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingReceita ? 'Editar Receita' : 'Nova Receita'}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Salário, Freelance..."
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag
                </label>
                <TagSelect
                  value={formData.tag_id}
                  onChange={(tagId) => setFormData({ ...formData, tag_id: tagId || '' })}
                  tipo="receita"
                  placeholder="Selecione uma tag (opcional)"
                />
              </div>

              <div className="py-2">
                <CustomSwitch
                  checked={formData.fixa}
                  onChange={(checked) => setFormData({ ...formData, fixa: checked })}
                  label="Receita fixa (recorrente)"
                />
              </div>

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
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  {editingReceita ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
