import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, startOfDay, endOfDay, getDay, getDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialData {
  receitas: any[];
  despesas: any[];
  investimentos: any[];
}

interface ChartData {
  name: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface DayOfWeekData {
  name: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface DayOfMonthData {
  day: number;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const Relatorios: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<FinancialData>({ receitas: [], despesas: [], investimentos: [] });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('day'); // 'day', 'week', 'month'

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, selectedPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let startDate: Date;
      let endDate = new Date();

      switch (selectedPeriod) {
        case 'day':
          startDate = startOfDay(new Date());
          endDate = endOfDay(new Date());
          break;
        case 'week':
          startDate = startOfWeek(new Date(), { locale: ptBR });
          endDate = endOfWeek(new Date(), { locale: ptBR });
          break;
        case 'month':
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
          break;
        default:
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
      }

      const [receitasResponse, despesasResponse, investimentosResponse] = await Promise.all([
        supabase
          .from('receitas')
          .select('*')
          .eq('user_id', user?.id)
          .gte('data', format(startDate, 'yyyy-MM-dd'))
          .lte('data', format(endDate, 'yyyy-MM-dd')),
        supabase
          .from('despesas')
          .select('*')
          .eq('user_id', user?.id)
          .gte('data', format(startDate, 'yyyy-MM-dd'))
          .lte('data', format(endDate, 'yyyy-MM-dd')),
        supabase
          .from('investimentos')
          .select('*')
          .eq('user_id', user?.id)
      ]);

      setData({
        receitas: receitasResponse.data || [],
        despesas: despesasResponse.data || [],
        investimentos: investimentosResponse.data || []
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDayOfWeekData = (): DayOfWeekData[] => {
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weekData: DayOfWeekData[] = [];

    for (let i = 0; i < 7; i++) {
      const dayReceitas = data.receitas
        .filter(r => getDay(new Date(r.data)) === i)
        .reduce((sum, r) => sum + parseFloat(r.valor), 0);
      
      const dayDespesas = data.despesas
        .filter(d => getDay(new Date(d.data)) === i)
        .reduce((sum, d) => sum + parseFloat(d.valor), 0);

      weekData.push({
        name: daysOfWeek[i],
        receitas: dayReceitas,
        despesas: dayDespesas,
        saldo: dayReceitas - dayDespesas
      });
    }

    return weekData;
  };

  const generateDayOfMonthData = (): DayOfMonthData[] => {
    const monthData: DayOfMonthData[] = [];
    const currentDate = new Date();
    const daysInMonth = endOfMonth(currentDate).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayReceitas = data.receitas
        .filter(r => getDate(new Date(r.data)) === day)
        .reduce((sum, r) => sum + parseFloat(r.valor), 0);
      
      const dayDespesas = data.despesas
        .filter(d => getDate(new Date(d.data)) === day)
        .reduce((sum, d) => sum + parseFloat(d.valor), 0);

      monthData.push({
        day,
        receitas: dayReceitas,
        despesas: dayDespesas,
        saldo: dayReceitas - dayDespesas
      });
    }

    return monthData;
  };

  const generateMonthlyData = (): ChartData[] => {
    const months: ChartData[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const monthReceitas = data.receitas
        .filter(r => new Date(r.data) >= start && new Date(r.data) <= end)
        .reduce((sum, r) => sum + parseFloat(r.valor), 0);
      
      const monthDespesas = data.despesas
        .filter(d => new Date(d.data) >= start && new Date(d.data) <= end)
        .reduce((sum, d) => sum + parseFloat(d.valor), 0);

      months.push({
        name: format(date, 'MMM/yy', { locale: ptBR }),
        receitas: monthReceitas,
        despesas: monthDespesas,
        saldo: monthReceitas - monthDespesas
      });
    }
    
    return months;
  };

  const generateCategoryData = (type: 'receitas' | 'despesas'): CategoryData[] => {
    const categories: { [key: string]: number } = {};
    
    data[type].forEach(item => {
      const category = item.descricao || 'Sem categoria';
      categories[category] = (categories[category] || 0) + parseFloat(item.valor);
    });

    return Object.entries(categories)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  const calculateTotals = () => {
    const totalReceitas = data.receitas.reduce((sum, r) => sum + parseFloat(r.valor), 0);
    const totalDespesas = data.despesas.reduce((sum, d) => sum + parseFloat(d.valor), 0);
    const totalInvestimentos = data.investimentos.reduce((sum, i) => sum + parseFloat(i.valor_inicial), 0);
    const saldoAtual = totalReceitas - totalDespesas;

    return { totalReceitas, totalDespesas, totalInvestimentos, saldoAtual };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-300 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-300 h-64 rounded-lg"></div>
            <div className="bg-gray-300 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const monthlyData = generateMonthlyData();
  const dayOfWeekData = generateDayOfWeekData();
  const dayOfMonthData = generateDayOfMonthData();
  const receitasCategories = generateCategoryData('receitas');
  const despesasCategories = generateCategoryData('despesas');
  const totals = calculateTotals();

  // Escolher dados baseado no período selecionado
  const getChartData = () => {
    switch (selectedPeriod) {
      case 'day':
        return dayOfWeekData;
      case 'week':
        return dayOfWeekData;
      case 'month':
        return dayOfMonthData;
      default:
        return monthlyData;
    }
  };

  const getChartTitle = () => {
    switch (selectedPeriod) {
      case 'day':
        return 'Gastos por Dia da Semana (Histórico)';
      case 'week':
        return 'Gastos por Dia da Semana (Esta Semana)';
      case 'month':
        return 'Gastos por Dia do Mês (Este Mês)';
      default:
        return 'Evolução Mensal';
    }
  };

  const chartData = getChartData();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios Financeiros</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="day">Hoje</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mês</option>
        </select>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Total Receitas
            <span className="block text-sm font-normal text-green-600">
              ({selectedPeriod === 'day' ? 'Hoje' : selectedPeriod === 'week' ? 'Esta Semana' : 'Este Mês'})
            </span>
          </h3>
          <p className="text-2xl font-bold text-green-600">
            R$ {totals.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Total Despesas
            <span className="block text-sm font-normal text-red-600">
              ({selectedPeriod === 'day' ? 'Hoje' : selectedPeriod === 'week' ? 'Esta Semana' : 'Este Mês'})
            </span>
          </h3>
          <p className="text-2xl font-bold text-red-600">
            R$ {totals.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Saldo Atual
            <span className="block text-sm font-normal text-blue-600">
              ({selectedPeriod === 'day' ? 'Hoje' : selectedPeriod === 'week' ? 'Esta Semana' : 'Este Mês'})
            </span>
          </h3>
          <p className={`text-2xl font-bold ${totals.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {totals.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">
            Investimentos
            <span className="block text-sm font-normal text-purple-600">
              (Total Geral)
            </span>
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            R$ {totals.totalInvestimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Gráfico de Evolução Baseado no Período */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{getChartTitle()}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={selectedPeriod === 'month' ? 'day' : 'name'} 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `R$ ${value.toFixed(2)}`}
              labelFormatter={(label) => 
                selectedPeriod === 'month' ? `Dia ${label}` : label
              }
            />
            <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
            <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficos de Pizza */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Receitas por Categoria</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={receitasCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {receitasCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Despesas por Categoria</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={despesasCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {despesasCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Linha do Saldo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Evolução do Saldo - {getChartTitle()}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={selectedPeriod === 'month' ? 'day' : 'name'} 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `R$ ${value.toFixed(2)}`}
              labelFormatter={(label) => 
                selectedPeriod === 'month' ? `Dia ${label}` : label
              }
            />
            <Line 
              type="monotone" 
              dataKey="saldo" 
              stroke="#8884d8" 
              strokeWidth={3}
              name="Saldo"
              dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico Histórico Mensal (sempre mostrado) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Histórico dos Últimos 6 Meses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
            <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
            <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
