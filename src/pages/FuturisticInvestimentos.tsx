import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, TrendingUp, Calendar, DollarSign, Zap, Search, Filter, Eye, Target, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface Investimento {
  id: string;
  nome: string;
  tipo: string;
  valor_inicial: number;
  valor_atual?: number;
  data_inicio: string;
  data_vencimento?: string;
  rentabilidade_esperada?: number;
  created_at: string;
}

export const FuturisticInvestimentos: React.FC = () => {
  const { user } = useAuth();
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [filteredInvestimentos, setFilteredInvestimentos] = useState<Investimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestimento, setEditingInvestimento] = useState<Investimento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cdb' | 'tesouro' | 'acoes' | 'fundos'>('all');
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    valor_inicial: '',
    valor_atual: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_vencimento: '',
    rentabilidade_esperada: ''
  });

  useEffect(() => {
    if (user) {
      fetchInvestimentos();
    }
  }, [user]);

  useEffect(() => {
    let filtered = investimentos;

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(investimento =>
        investimento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investimento.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(investimento =>
        investimento.tipo.toLowerCase().includes(filterType)
      );
    }

    setFilteredInvestimentos(filtered);
  }, [investimentos, searchTerm, filterType]);

  const fetchInvestimentos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('investimentos')
        .select('*')
        .eq('user_id', user?.id)
        .order('data_inicio', { ascending: false });

      if (error) {
        console.error('Erro ao buscar investimentos:', error);
        return;
      }

      setInvestimentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.tipo || !formData.valor_inicial) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const valorInicial = parseFloat(formData.valor_inicial.replace(',', '.'));
      const valorAtual = formData.valor_atual ? parseFloat(formData.valor_atual.replace(',', '.')) : null;
      const rentabilidade = formData.rentabilidade_esperada ? parseFloat(formData.rentabilidade_esperada.replace(',', '.')) : null;
      
      if (editingInvestimento) {
        const { error } = await supabase
          .from('investimentos')
          .update({
            nome: formData.nome,
            tipo: formData.tipo,
            valor_inicial: valorInicial,
            valor_atual: valorAtual,
            data_inicio: formData.data_inicio,
            data_vencimento: formData.data_vencimento || null,
            rentabilidade_esperada: rentabilidade
          })
          .eq('id', editingInvestimento.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('investimentos')
          .insert({
            nome: formData.nome,
            tipo: formData.tipo,
            valor_inicial: valorInicial,
            valor_atual: valorAtual,
            data_inicio: formData.data_inicio,
            data_vencimento: formData.data_vencimento || null,
            rentabilidade_esperada: rentabilidade,
            user_id: user?.id
          });

        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingInvestimento(null);
      setFormData({
        nome: '',
        tipo: '',
        valor_inicial: '',
        valor_atual: '',
        data_inicio: new Date().toISOString().split('T')[0],
        data_vencimento: '',
        rentabilidade_esperada: ''
      });
      fetchInvestimentos();
    } catch (error) {
      console.error('Erro ao salvar investimento:', error);
      alert('Erro ao salvar investimento. Tente novamente.');
    }
  };

  const handleEdit = (investimento: Investimento) => {
    setEditingInvestimento(investimento);
    setFormData({
      nome: investimento.nome,
      tipo: investimento.tipo,
      valor_inicial: investimento.valor_inicial.toString(),
      valor_atual: investimento.valor_atual?.toString() || '',
      data_inicio: investimento.data_inicio,
      data_vencimento: investimento.data_vencimento || '',
      rentabilidade_esperada: investimento.rentabilidade_esperada?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este investimento?')) return;

    try {
      const { error } = await supabase
        .from('investimentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchInvestimentos();
    } catch (error) {
      console.error('Erro ao excluir investimento:', error);
      alert('Erro ao excluir investimento. Tente novamente.');
    }
  };

  const totalInvestido = investimentos.reduce((sum, inv) => sum + inv.valor_inicial, 0);
  const totalAtual = investimentos.reduce((sum, inv) => sum + (inv.valor_atual || inv.valor_inicial), 0);
  const rentabilidadeTotal = totalAtual - totalInvestido;
  const percentualRentabilidade = totalInvestido > 0 ? (rentabilidadeTotal / totalInvestido) * 100 : 0;

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
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <span>Investimentos</span>
          </h1>
          <p className="text-text-muted">Faça seu dinheiro trabalhar para você</p>
        </div>
        
        <button
          onClick={() => {
            setEditingInvestimento(null);
            setFormData({
              nome: '',
              tipo: '',
              valor_inicial: '',
              valor_atual: '',
              data_inicio: new Date().toISOString().split('T')[0],
              data_vencimento: '',
              rentabilidade_esperada: ''
            });
            setIsModalOpen(true);
          }}
          className="futuristic-button-primary mt-4 lg:mt-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Investimento
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card animate-fade-in">
          <div className="metric-label flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span>Total Investido</span>
          </div>
          <div className="metric-value">{formatCurrency(totalInvestido)}</div>
          <div className="metric-trend positive">
            <span>{investimentos.length} investimentos ativos</span>
          </div>
        </div>
        
        <div className="metric-card animate-fade-in" style={{animationDelay: '100ms'}}>
          <div className="metric-label flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span>Valor Atual</span>
          </div>
          <div className="metric-value">{formatCurrency(totalAtual)}</div>
          <div className={`metric-trend ${rentabilidadeTotal >= 0 ? 'positive' : 'negative'}`}>
            <span>{rentabilidadeTotal >= 0 ? '+' : ''}{formatCurrency(rentabilidadeTotal)}</span>
          </div>
        </div>
        
        <div className="metric-card animate-fade-in" style={{animationDelay: '200ms'}}>
          <div className="metric-label flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-accent-gold" />
            <span>Rentabilidade</span>
          </div>
          <div className={`metric-value ${percentualRentabilidade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {percentualRentabilidade >= 0 ? '+' : ''}{percentualRentabilidade.toFixed(2)}%
          </div>
          <div className={`metric-trend ${percentualRentabilidade >= 0 ? 'positive' : 'negative'}`}>
            <span>Performance do portfolio</span>
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
              placeholder="Buscar investimentos..."
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
              onChange={(e) => setFilterType(e.target.value as 'all' | 'cdb' | 'tesouro' | 'acoes' | 'fundos')}
              className="futuristic-select"
            >
              <option value="all">Todos os Tipos</option>
              <option value="cdb">CDB</option>
              <option value="tesouro">Tesouro Direto</option>
              <option value="acoes">Ações</option>
              <option value="fundos">Fundos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Investimentos List */}
      <div className="card-futuristic p-6 animate-fade-in" style={{animationDelay: '400ms'}}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary flex items-center space-x-2">
            <Eye className="w-5 h-5 text-accent-gold" />
            <span>Portfolio de Investimentos</span>
          </h2>
          <span className="text-sm text-text-muted">{filteredInvestimentos.length} de {investimentos.length}</span>
        </div>
        
        {filteredInvestimentos.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredInvestimentos.map((investimento) => {
              const valorAtual = investimento.valor_atual || investimento.valor_inicial;
              const rentabilidade = valorAtual - investimento.valor_inicial;
              const percentual = (rentabilidade / investimento.valor_inicial) * 100;
              
              return (
                <div key={investimento.id} className="p-4 bg-dark-secondary rounded-xl border border-dark-border hover:border-purple-400/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="font-medium text-text-primary group-hover:text-purple-400 transition-colors">
                          {investimento.nome}
                        </p>
                        <span className="text-xs bg-purple-400/20 text-purple-400 px-2 py-1 rounded-lg">
                          {investimento.tipo}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-1 text-text-muted">
                          <Calendar className="w-4 h-4" />
                          <span>Início: {new Date(investimento.data_inicio).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {investimento.data_vencimento && (
                          <div className="flex items-center space-x-1 text-text-muted">
                            <Target className="w-4 h-4" />
                            <span>Vence: {new Date(investimento.data_vencimento).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1 text-text-muted">
                          <DollarSign className="w-4 h-4" />
                          <span>Investido: {formatCurrency(investimento.valor_inicial)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className={`w-4 h-4 ${rentabilidade >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                          <span className={rentabilidade >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {rentabilidade >= 0 ? '+' : ''}{percentual.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-purple-400 text-lg">
                          {formatCurrency(valorAtual)}
                        </p>
                        <p className={`text-sm ${rentabilidade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {rentabilidade >= 0 ? '+' : ''}{formatCurrency(rentabilidade)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(investimento)}
                          className="p-2 text-text-muted hover:text-accent-gold hover:bg-dark-card rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(investimento.id)}
                          className="p-2 text-text-muted hover:text-red-400 hover:bg-dark-card rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-text-muted">Nenhum investimento encontrado</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card-futuristic p-8 w-full max-w-md animate-slide-up">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              {editingInvestimento ? 'Editar Investimento' : 'Novo Investimento'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Nome do Investimento *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="futuristic-input"
                  placeholder="Ex: CDB Banco XYZ"
                  required
                />
              </div>
              
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Tipo de Investimento *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="futuristic-select w-full"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="CDB">CDB</option>
                  <option value="Tesouro Direto">Tesouro Direto</option>
                  <option value="Ações">Ações</option>
                  <option value="Fundos">Fundos de Investimento</option>
                  <option value="LCI/LCA">LCI/LCA</option>
                  <option value="Poupança">Poupança</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Valor Inicial *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor_inicial}
                  onChange={(e) => setFormData({ ...formData, valor_inicial: e.target.value })}
                  className="futuristic-input"
                  placeholder="0,00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Valor Atual
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor_atual}
                  onChange={(e) => setFormData({ ...formData, valor_atual: e.target.value })}
                  className="futuristic-input"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Data de Início *
                </label>
                <input
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  className="futuristic-input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                  className="futuristic-input"
                />
              </div>
              
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Rentabilidade Esperada (% a.a.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rentabilidade_esperada}
                  onChange={(e) => setFormData({ ...formData, rentabilidade_esperada: e.target.value })}
                  className="futuristic-input"
                  placeholder="12,5"
                />
              </div>
              
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
                  {editingInvestimento ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};