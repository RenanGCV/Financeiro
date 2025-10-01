import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, DollarSign, Calendar, TrendingDown, Zap, Search, Filter, Eye, CreditCard } from 'lucide-react';
import { TagSelect } from '../components/TagSelect';
import { CustomSwitch } from '../components/CustomSwitch';
import { formatCurrency } from '../utils/currency';

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

export const FuturisticDespesas: React.FC = () => {
  const { user } = useAuth();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [filteredDespesas, setFilteredDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fixa' | 'variavel' | 'parcelado'>('all');
  const [formData, setFormData] = useState({
    valor: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    tag_id: '',
    fixa: false,
    parcelado: false,
    total_parcelas: ''
  });

  useEffect(() => {
    if (user) {
      fetchDespesas();
    }
  }, [user]);

  useEffect(() => {
    let filtered = despesas;

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(despesa =>
        despesa.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(despesa => {
        switch (filterType) {
          case 'fixa': return despesa.fixa;
          case 'variavel': return !despesa.fixa && !despesa.parcelado;
          case 'parcelado': return despesa.parcelado;
          default: return true;
        }
      });
    }

    setFilteredDespesas(filtered);
  }, [despesas, searchTerm, filterType]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.valor || !formData.descricao) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validação adicional para parcelas
    if (formData.parcelado && (!formData.total_parcelas || parseInt(formData.total_parcelas) < 1)) {
      alert('Por favor, informe o número de parcelas (mínimo 1).');
      return;
    }

    try {
      const valor = parseFloat(formData.valor.replace(',', '.'));
      const totalParcelas = formData.parcelado ? parseInt(formData.total_parcelas) : null;
      
      // Validação do valor
      if (isNaN(valor) || valor <= 0) {
        alert('Por favor, informe um valor válido.');
        return;
      }
      
      if (editingDespesa) {
        const { error } = await supabase
          .from('despesas')
          .update({
            valor,
            descricao: formData.descricao,
            data: formData.data,
            tag_id: formData.tag_id && formData.tag_id.trim() !== '' ? formData.tag_id : null,
            fixa: formData.fixa,
            parcelado: formData.parcelado,
            total_parcelas: totalParcelas,
            parcela_atual: formData.parcelado ? 1 : null
          })
          .eq('id', editingDespesa.id);

        if (error) throw error;
      } else {
        // Log dos dados que estão sendo enviados para debug
        const dadosParaInserir = {
          valor,
          descricao: formData.descricao,
          data: formData.data,
          tag_id: formData.tag_id && formData.tag_id.trim() !== '' ? formData.tag_id : null,
          fixa: formData.fixa,
          parcelado: formData.parcelado,
          total_parcelas: totalParcelas,
          parcela_atual: formData.parcelado ? 1 : null,
          user_id: user?.id
        };
        
        console.log('Dados sendo inseridos:', dadosParaInserir);
        
        const { error } = await supabase
          .from('despesas')
          .insert(dadosParaInserir);

        if (error) {
          console.error('Erro específico do Supabase:', error);
          throw error;
        }
      }

      setIsModalOpen(false);
      setEditingDespesa(null);
      setFormData({
        valor: '',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        tag_id: '',
        fixa: false,
        parcelado: false,
        total_parcelas: ''
      });
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      
      // Verificar se é erro específico do banco de dados
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('check constraint')) {
          alert('Erro de validação: Verifique se os valores estão corretos (valor deve ser positivo, parcelas devem ser válidas).');
        } else if (errorMessage.includes('foreign key')) {
          alert('Erro de referência: Verifique se a tag selecionada é válida.');
        } else if (errorMessage.includes('not null')) {
          alert('Erro de campo obrigatório: Todos os campos obrigatórios devem ser preenchidos.');
        } else {
          alert(`Erro ao salvar despesa: ${errorMessage}`);
        }
      } else {
        alert('Erro ao salvar despesa. Tente novamente.');
      }
    }
  };

  const handleEdit = (despesa: Despesa) => {
    setEditingDespesa(despesa);
    setFormData({
      valor: despesa.valor.toString(),
      descricao: despesa.descricao,
      data: despesa.data,
      tag_id: despesa.tag_id || '',
      fixa: despesa.fixa,
      parcelado: despesa.parcelado,
      total_parcelas: despesa.total_parcelas?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      alert('Erro ao excluir despesa. Tente novamente.');
    }
  };

  const totalDespesas = despesas.reduce((sum, despesa) => sum + despesa.valor, 0);
  const despesasFixas = despesas.filter(d => d.fixa);
  const totalFixas = despesasFixas.reduce((sum, despesa) => sum + despesa.valor, 0);
  const despesasParceladas = despesas.filter(d => d.parcelado);
  const totalParceladas = despesasParceladas.reduce((sum, despesa) => sum + despesa.valor, 0);

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
          <h1 className="text-4xl font-bold text-text-primary mb-2 flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <span>Despesas</span>
          </h1>
          <p className="text-text-muted">Controle total dos seus gastos</p>
        </div>
        
        <button
          onClick={() => {
            setEditingDespesa(null);
            setFormData({
              valor: '',
              descricao: '',
              data: new Date().toISOString().split('T')[0],
              tag_id: '',
              fixa: false,
              parcelado: false,
              total_parcelas: ''
            });
            setIsModalOpen(true);
          }}
          className="futuristic-button-primary mt-4 lg:mt-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Despesa
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card animate-fade-in">
          <div className="metric-label flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span>Total de Despesas</span>
          </div>
          <div className="metric-value">{formatCurrency(totalDespesas)}</div>
          <div className="metric-trend negative">
            <span>{despesas.length} despesas registradas</span>
          </div>
        </div>
        
        <div className="metric-card animate-fade-in" style={{animationDelay: '100ms'}}>
          <div className="metric-label flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span>Despesas Fixas</span>
          </div>
          <div className="metric-value">{formatCurrency(totalFixas)}</div>
          <div className="metric-trend positive">
            <span>{despesasFixas.length} despesas fixas</span>
          </div>
        </div>
        
        <div className="metric-card animate-fade-in" style={{animationDelay: '200ms'}}>
          <div className="metric-label flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-accent-orange" />
            <span>Despesas Parceladas</span>
          </div>
          <div className="metric-value">{formatCurrency(totalParceladas)}</div>
          <div className="metric-trend positive">
            <span>{despesasParceladas.length} despesas parceladas</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-futuristic p-6 animate-fade-in" style={{animationDelay: '300ms'}}>
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar despesas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="futuristic-input pl-12"
            />
          </div>
          
          {/* Filter */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-text-muted" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'fixa' | 'variavel' | 'parcelado')}
              className="futuristic-select"
            >
              <option value="all">Todas</option>
              <option value="fixa">Apenas Fixas</option>
              <option value="variavel">Apenas Variáveis</option>
              <option value="parcelado">Apenas Parceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Despesas List */}
      <div className="card-futuristic p-6 animate-fade-in" style={{animationDelay: '400ms'}}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary flex items-center space-x-2">
            <Eye className="w-5 h-5 text-accent-gold" />
            <span>Lista de Despesas</span>
          </h2>
          <span className="text-sm text-text-muted">{filteredDespesas.length} de {despesas.length}</span>
        </div>
        
        {filteredDespesas.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredDespesas.map((despesa) => (
              <div key={despesa.id} className="p-4 bg-dark-secondary rounded-xl border border-dark-border hover:border-red-400/30 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="font-medium text-text-primary group-hover:text-red-400 transition-colors">
                        {despesa.descricao}
                      </p>
                      {despesa.fixa && (
                        <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded-lg">
                          Fixa
                        </span>
                      )}
                      {despesa.parcelado && (
                        <span className="text-xs bg-accent-orange/20 text-accent-orange px-2 py-1 rounded-lg">
                          {despesa.total_parcelas}x
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-sm text-text-muted flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(despesa.data).toLocaleDateString('pt-BR')}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <p className="font-bold text-red-400 text-lg">
                      -{formatCurrency(despesa.valor)}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(despesa)}
                        className="p-2 text-text-muted hover:text-accent-gold hover:bg-dark-card rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(despesa.id)}
                        className="p-2 text-text-muted hover:text-red-400 hover:bg-dark-card rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingDown className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-text-muted">Nenhuma despesa encontrada</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card-futuristic p-8 w-full max-w-md animate-slide-up">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="futuristic-input"
                  placeholder="Digite a descrição da despesa"
                  required
                />
              </div>
              
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className="futuristic-input"
                  placeholder="0,00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="futuristic-input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Tag (Opcional)
                </label>
                <TagSelect
                  tipo="despesa"
                  value={formData.tag_id}
                  onChange={(value) => setFormData({ ...formData, tag_id: value || '' })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-dark-secondary rounded-xl border border-dark-border">
                <div>
                  <p className="text-text-primary font-medium">Despesa Fixa</p>
                  <p className="text-text-muted text-sm">Esta despesa se repete mensalmente</p>
                </div>
                <CustomSwitch
                  label=""
                  checked={formData.fixa}
                  onChange={(checked) => setFormData({ ...formData, fixa: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-dark-secondary rounded-xl border border-dark-border">
                <div>
                  <p className="text-text-primary font-medium">Despesa Parcelada</p>
                  <p className="text-text-muted text-sm">Dividir em parcelas</p>
                </div>
                <CustomSwitch
                  label=""
                  checked={formData.parcelado}
                  onChange={(checked) => setFormData({ ...formData, parcelado: checked })}
                />
              </div>
              
              {formData.parcelado && (
                <div>
                  <label className="block text-text-secondary text-sm font-medium mb-2">
                    Número de Parcelas
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={formData.total_parcelas}
                    onChange={(e) => setFormData({ ...formData, total_parcelas: e.target.value })}
                    className="futuristic-input"
                    placeholder="Ex: 12"
                    required={formData.parcelado}
                  />
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="futuristic-button-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="futuristic-button-primary flex-1"
                >
                  {editingDespesa ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};