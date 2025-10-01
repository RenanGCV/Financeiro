import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Target, Calendar, DollarSign, Zap, BarChart3, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface MetaSaldo {
  id: string;
  valor_meta: number;
  data_objetivo: string;
  descricao: string;
  atingida: boolean;
  created_at: string;
}

export const FuturisticMetaSaldo: React.FC = () => {
  const { user } = useAuth();
  const [metaSaldo, setMetaSaldo] = useState<MetaSaldo | null>(null);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    valor_meta: '',
    data_objetivo: '',
    descricao: ''
  });

  useEffect(() => {
    if (user) {
      fetchMetaSaldo();
      fetchSaldoAtual();
    }
  }, [user]);

  const fetchMetaSaldo = async () => {
    try {
      const { data, error } = await supabase
        .from('meta_saldo')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar meta de saldo:', error);
        return;
      }

      setMetaSaldo(data);
      if (data) {
        setFormData({
          valor_meta: data.valor_meta.toString(),
          data_objetivo: data.data_objetivo,
          descricao: data.descricao
        });
      }
    } catch (error) {
      console.error('Erro ao buscar meta de saldo:', error);
    }
  };

  const fetchSaldoAtual = async () => {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      const [receitasResult, despesasResult] = await Promise.all([
        supabase
          .from('receitas')
          .select('valor')
          .eq('user_id', user?.id)
          .gte('data', inicioMes.toISOString().split('T')[0])
          .lte('data', fimMes.toISOString().split('T')[0]),
        supabase
          .from('despesas')
          .select('valor')
          .eq('user_id', user?.id)
          .gte('data', inicioMes.toISOString().split('T')[0])
          .lte('data', fimMes.toISOString().split('T')[0])
      ]);

      const totalReceitas = receitasResult.data?.reduce((sum, r) => sum + r.valor, 0) || 0;
      const totalDespesas = despesasResult.data?.reduce((sum, d) => sum + d.valor, 0) || 0;
      const saldo = totalReceitas - totalDespesas;

      setSaldoAtual(saldo);
    } catch (error) {
      console.error('Erro ao calcular saldo atual:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.valor_meta || !formData.data_objetivo || !formData.descricao) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const valorMeta = parseFloat(formData.valor_meta.replace(',', '.'));
      const atingida = saldoAtual >= valorMeta;
      
      if (metaSaldo) {
        const { error } = await supabase
          .from('meta_saldo')
          .update({
            valor_meta: valorMeta,
            data_objetivo: formData.data_objetivo,
            descricao: formData.descricao,
            atingida
          })
          .eq('id', metaSaldo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('meta_saldo')
          .insert({
            valor_meta: valorMeta,
            data_objetivo: formData.data_objetivo,
            descricao: formData.descricao,
            atingida,
            user_id: user?.id
          });

        if (error) throw error;
      }

      setIsEditing(false);
      fetchMetaSaldo();
    } catch (error) {
      console.error('Erro ao salvar meta de saldo:', error);
      alert('Erro ao salvar meta de saldo. Tente novamente.');
    }
  };

  const calcularProgressoPercentual = () => {
    if (!metaSaldo || metaSaldo.valor_meta <= 0) return 0;
    return Math.min((saldoAtual / metaSaldo.valor_meta) * 100, 100);
  };

  const calcularDiasRestantes = () => {
    if (!metaSaldo) return 0;
    const hoje = new Date();
    const dataObjetivo = new Date(metaSaldo.data_objetivo);
    const diffTime = dataObjetivo.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calcularEconomiaRequerida = () => {
    if (!metaSaldo) return 0;
    const diferenca = metaSaldo.valor_meta - saldoAtual;
    const diasRestantes = calcularDiasRestantes();
    if (diasRestantes <= 0) return 0;
    return diferenca / diasRestantes;
  };

  const progressoPercentual = calcularProgressoPercentual();
  const diasRestantes = calcularDiasRestantes();
  const economiaRequerida = calcularEconomiaRequerida();
  const metaAtingida = metaSaldo?.atingida || (metaSaldo && saldoAtual >= metaSaldo.valor_meta);

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
            <div className="w-3 h-3 bg-accent-gold rounded-full animate-pulse"></div>
            <span>Meta de Saldo</span>
          </h1>
          <p className="text-text-muted">Defina e acompanhe seus objetivos financeiros</p>
        </div>
        
        {metaSaldo && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="futuristic-button-primary mt-4 lg:mt-0"
          >
            <Target className="w-5 h-5 mr-2" />
            Editar Meta
          </button>
        )}
      </div>

      {/* Status Card */}
      {metaSaldo && (
        <div className={`card-futuristic p-8 animate-fade-in border-2 ${
          metaAtingida ? 'border-green-400/30 bg-green-400/5' : 'border-accent-gold/30 bg-accent-gold/5'
        }`}>
          <div className="flex items-center justify-center mb-6">
            {metaAtingida ? (
              <CheckCircle className="w-16 h-16 text-green-400" />
            ) : (
              <Target className="w-16 h-16 text-accent-gold" />
            )}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {metaAtingida ? 'Meta Atingida! 🎉' : 'Meta em Progresso'}
            </h2>
            <p className="text-text-muted mb-6">{metaSaldo.descricao}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-dark-secondary rounded-full h-4 mb-6">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ${
                  metaAtingida ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-accent-gold to-accent-orange'
                }`}
                style={{ width: `${progressoPercentual}%` }}
              ></div>
            </div>
            
            <div className="text-4xl font-bold mb-2">
              <span className={metaAtingida ? 'text-green-400' : 'text-accent-gold'}>
                {progressoPercentual.toFixed(1)}%
              </span>
            </div>
            <p className="text-text-muted">do objetivo alcançado</p>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card animate-fade-in">
          <div className="metric-label flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span>Saldo Atual</span>
          </div>
          <div className={`metric-value ${saldoAtual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(saldoAtual)}
          </div>
          <div className={`metric-trend ${saldoAtual >= 0 ? 'positive' : 'negative'}`}>
            <span>Saldo do mês corrente</span>
          </div>
        </div>
        
        <div className="metric-card animate-fade-in" style={{animationDelay: '100ms'}}>
          <div className="metric-label flex items-center space-x-2">
            <Target className="w-4 h-4 text-accent-gold" />
            <span>Meta Definida</span>
          </div>
          <div className="metric-value">
            {metaSaldo ? formatCurrency(metaSaldo.valor_meta) : 'Não definida'}
          </div>
          <div className="metric-trend positive">
            <span>Objetivo a alcançar</span>
          </div>
        </div>
        
        <div className="metric-card animate-fade-in" style={{animationDelay: '200ms'}}>
          <div className="metric-label flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Dias Restantes</span>
          </div>
          <div className={`metric-value ${diasRestantes > 0 ? 'text-text-primary' : 'text-red-400'}`}>
            {diasRestantes > 0 ? diasRestantes : 'Expirado'}
          </div>
          <div className="metric-trend positive">
            <span>Para atingir a meta</span>
          </div>
        </div>
      </div>

      {/* Analysis Card */}
      {metaSaldo && !metaAtingida && (
        <div className="card-futuristic p-6 animate-fade-in" style={{animationDelay: '300ms'}}>
          <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-accent-gold" />
            <span>Análise de Progresso</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-dark-secondary rounded-xl border border-dark-border">
              <h4 className="font-medium text-text-primary mb-2">Faltam para a Meta</h4>
              <p className="text-2xl font-bold text-accent-orange">
                {formatCurrency(metaSaldo.valor_meta - saldoAtual)}
              </p>
              <p className="text-text-muted text-sm mt-1">
                {((metaSaldo.valor_meta - saldoAtual) / metaSaldo.valor_meta * 100).toFixed(1)}% do total
              </p>
            </div>
            
            <div className="p-4 bg-dark-secondary rounded-xl border border-dark-border">
              <h4 className="font-medium text-text-primary mb-2">Economia Diária Necessária</h4>
              <p className="text-2xl font-bold text-blue-400">
                {economiaRequerida > 0 ? formatCurrency(economiaRequerida) : 'Meta expirada'}
              </p>
              <p className="text-text-muted text-sm mt-1">
                Para atingir no prazo
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-accent-gold/10 rounded-xl border border-accent-gold/20">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-accent-gold mt-0.5" />
              <div>
                <h4 className="font-medium text-text-primary mb-1">Dica Personalizada</h4>
                <p className="text-text-muted text-sm">
                  {diasRestantes > 0 
                    ? `Para atingir sua meta, você precisa economizar ${formatCurrency(economiaRequerida)} por dia pelos próximos ${diasRestantes} dias.`
                    : 'Sua meta expirou. Considere redefinir a data objetivo ou ajustar o valor da meta.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      {(isEditing || !metaSaldo) && (
        <div className="card-futuristic p-8 animate-fade-in" style={{animationDelay: '400ms'}}>
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            {metaSaldo ? 'Editar Meta de Saldo' : 'Definir Meta de Saldo'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Valor da Meta *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valor_meta}
                onChange={(e) => setFormData({ ...formData, valor_meta: e.target.value })}
                className="futuristic-input"
                placeholder="0,00"
                required
              />
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Data Objetivo *
              </label>
              <input
                type="date"
                value={formData.data_objetivo}
                onChange={(e) => setFormData({ ...formData, data_objetivo: e.target.value })}
                className="futuristic-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">
                Descrição da Meta *
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="futuristic-input"
                placeholder="Ex: Reserva de emergência, Viagem, Compra de um carro..."
                rows={3}
                required
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              {metaSaldo && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="futuristic-button-secondary flex-1"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="futuristic-button-primary flex-1"
              >
                <Save className="w-5 h-5 mr-2" />
                {metaSaldo ? 'Atualizar Meta' : 'Definir Meta'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};