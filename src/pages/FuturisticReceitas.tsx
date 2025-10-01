import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, DollarSign, Calendar, FileText, TrendingUp, Zap, Search, Filter, Eye, Clock } from 'lucide-react';
import { TagSelect } from '../components/TagSelect';
import { CustomSwitch } from '../components/CustomSwitch';
import { formatCurrency } from '../utils/currency';
import diasUteisUtils from '../utils/diasUteis';

interface Receita {
  id: string;
  valor: number;
  descricao: string;
  data: string;
  tag_id?: string;
  fixa: boolean;
  usa_dia_util?: boolean;
  dia_util_numero?: number;
  created_at: string;
}

export const FuturisticReceitas: React.FC = () => {
  const { user } = useAuth();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [filteredReceitas, setFilteredReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fixa' | 'variavel'>('all');
  const [formData, setFormData] = useState({
    valor: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    tag_id: '',
    fixa: false,
    usa_dia_util: false,
    dia_util_numero: 1
  });

  useEffect(() => {
    if (user) {
      fetchReceitas();
    }
  }, [user]);

  useEffect(() => {
    let filtered = receitas;

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(receita =>
        receita.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(receita =>
        filterType === 'fixa' ? receita.fixa : !receita.fixa
      );
    }

    setFilteredReceitas(filtered);
  }, [receitas, searchTerm, filterType]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.valor || !formData.descricao) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const valor = parseFloat(formData.valor.replace(',', '.'));
      
      if (editingReceita) {
        const { error } = await supabase
          .from('receitas')
          .update({
            valor,
            descricao: formData.descricao,
            data: formData.data,
            tag_id: formData.tag_id || null,
            fixa: formData.fixa,
            usa_dia_util: formData.usa_dia_util,
            dia_util_numero: formData.usa_dia_util ? formData.dia_util_numero : null
          })
          .eq('id', editingReceita.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('receitas')
          .insert({
            valor,
            descricao: formData.descricao,
            data: formData.data,
            tag_id: formData.tag_id || null,
            fixa: formData.fixa,
            usa_dia_util: formData.usa_dia_util,
            dia_util_numero: formData.usa_dia_util ? formData.dia_util_numero : null,
            user_id: user?.id
          });

        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingReceita(null);
      setFormData({
        valor: '',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        tag_id: '',
        fixa: false,
        usa_dia_util: false,
        dia_util_numero: 1
      });
      fetchReceitas();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      alert('Erro ao salvar receita. Tente novamente.');
    }
  };

  const handleEdit = (receita: Receita) => {
    setEditingReceita(receita);
    setFormData({
      valor: receita.valor.toString(),
      descricao: receita.descricao,
      data: receita.data,
      tag_id: receita.tag_id || '',
      fixa: receita.fixa,
      usa_dia_util: receita.usa_dia_util || false,
      dia_util_numero: receita.dia_util_numero || 1
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;

    try {
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchReceitas();
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      alert('Erro ao excluir receita. Tente novamente.');
    }
  };

  const totalReceitas = receitas.reduce((sum, receita) => sum + receita.valor, 0);
  const receitasFixas = receitas.filter(r => r.fixa);
  const totalFixas = receitasFixas.reduce((sum, receita) => sum + receita.valor, 0);
  const totalVariaveis = totalReceitas - totalFixas;

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
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span>Receitas</span>
          </h1>
          <p className="text-text-muted">Gerencie suas fontes de renda com inteligência</p>
        </div>
        
        <button
          onClick={() => {
            setEditingReceita(null);
            setFormData({
              valor: '',
              descricao: '',
              data: new Date().toISOString().split('T')[0],
              tag_id: '',
              fixa: false,
              usa_dia_util: false,
              dia_util_numero: 1
            });
            setIsModalOpen(true);
          }}
          className="futuristic-button-primary mt-4 lg:mt-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Receita
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card animate-fade-in">
          <div className="metric-label flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span>Total de Receitas</span>
          </div>
          <div className="metric-value">{formatCurrency(totalReceitas)}</div>
          <div className="metric-trend positive">
            <span>{receitas.length} entradas registradas</span>
          </div>
        </div>
        
        <div className="metric-card animate-fade-in" style={{animationDelay: '100ms'}}>
          <div className="metric-label flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span>Receitas Fixas</span>
          </div>
          <div className="metric-value">{formatCurrency(totalFixas)}</div>
          <div className="metric-trend positive">
            <span>{receitasFixas.length} receitas fixas</span>
          </div>
        </div>
        
        <div className="metric-card animate-fade-in" style={{animationDelay: '200ms'}}>
          <div className="metric-label flex items-center space-x-2">
            <FileText className="w-4 h-4 text-accent-orange" />
            <span>Receitas Variáveis</span>
          </div>
          <div className="metric-value">{formatCurrency(totalVariaveis)}</div>
          <div className="metric-trend positive">
            <span>{receitas.length - receitasFixas.length} receitas variáveis</span>
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
              placeholder="Buscar receitas..."
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
              onChange={(e) => setFilterType(e.target.value as 'all' | 'fixa' | 'variavel')}
              className="futuristic-select"
            >
              <option value="all">Todas</option>
              <option value="fixa">Apenas Fixas</option>
              <option value="variavel">Apenas Variáveis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receitas List */}
      <div className="card-futuristic p-6 animate-fade-in" style={{animationDelay: '400ms'}}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary flex items-center space-x-2">
            <Eye className="w-5 h-5 text-accent-gold" />
            <span>Lista de Receitas</span>
          </h2>
          <span className="text-sm text-text-muted">{filteredReceitas.length} de {receitas.length}</span>
        </div>
        
        {filteredReceitas.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredReceitas.map((receita) => (
              <div key={receita.id} className="p-4 bg-dark-secondary rounded-xl border border-dark-border hover:border-green-400/30 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="font-medium text-text-primary group-hover:text-green-400 transition-colors">
                        {receita.descricao}
                      </p>
                      {receita.fixa && (
                        <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded-lg">
                          Fixa
                        </span>
                      )}
                      {receita.usa_dia_util && receita.dia_util_numero && (
                        <span className="text-xs bg-accent-gold/20 text-accent-gold px-2 py-1 rounded-lg flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{diasUteisUtils.formatarNumeroDiaUtil(receita.dia_util_numero)}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-sm text-text-muted flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(receita.data).toLocaleDateString('pt-BR')}</span>
                      </p>
                      {receita.usa_dia_util && receita.dia_util_numero && (
                        <p className="text-xs text-accent-gold/80 flex items-center space-x-1">
                          <span>•</span>
                          <span>Dia útil: {receita.dia_util_numero}º</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <p className="font-bold text-green-400 text-lg">
                      +{formatCurrency(receita.valor)}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(receita)}
                        className="p-2 text-text-muted hover:text-accent-gold hover:bg-dark-card rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(receita.id)}
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
            <TrendingUp className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-text-muted">Nenhuma receita encontrada</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card-futuristic p-8 w-full max-w-md animate-slide-up">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              {editingReceita ? 'Editar Receita' : 'Nova Receita'}
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
                  placeholder="Digite a descrição da receita"
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
                  tipo="receita"
                  value={formData.tag_id}
                  onChange={(value) => setFormData({ ...formData, tag_id: value || '' })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-dark-secondary rounded-xl border border-dark-border">
                <div>
                  <p className="text-text-primary font-medium">Receita Fixa</p>
                  <p className="text-text-muted text-sm">Esta receita se repete mensalmente</p>
                </div>
                <CustomSwitch
                  label=""
                  checked={formData.fixa}
                  onChange={(checked) => setFormData({ ...formData, fixa: checked })}
                />
              </div>

              {/* Configuração de Dias Úteis - aparece apenas se receita fixa estiver ativa */}
              {formData.fixa && (
                <div className="space-y-4 p-4 bg-dark-secondary rounded-xl border border-dark-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-primary font-medium flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-accent-gold" />
                        <span>Calcular por Dia Útil</span>
                      </p>
                      <p className="text-text-muted text-sm">
                        Define o recebimento baseado em dias úteis (seg-sex, excluindo feriados)
                      </p>
                    </div>
                    <CustomSwitch
                      label=""
                      checked={formData.usa_dia_util}
                      onChange={(checked) => setFormData({ ...formData, usa_dia_util: checked })}
                    />
                  </div>

                  {/* Seletor do número do dia útil */}
                  {formData.usa_dia_util && (
                    <div>
                      <label className="block text-text-secondary text-sm font-medium mb-2">
                        Dia Útil do Recebimento
                      </label>
                      <select
                        value={formData.dia_util_numero}
                        onChange={(e) => setFormData({ ...formData, dia_util_numero: parseInt(e.target.value) })}
                        className="futuristic-select w-full"
                      >
                        {Array.from({ length: 23 }, (_, i) => i + 1).map((numero) => (
                          <option key={numero} value={numero}>
                            {diasUteisUtils.formatarNumeroDiaUtil(numero)} 
                            {numero <= 5 && ` (início do mês)`}
                            {numero >= 20 && ` (final do mês)`}
                          </option>
                        ))}
                      </select>
                      <p className="text-text-muted text-xs mt-1">
                        Exemplo: "5º dia útil" = quinta primeira semana útil do mês
                      </p>
                    </div>
                  )}
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
                  {editingReceita ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};