import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface SaldoGaugeProps {
  saldoAtual: number;
  meta: number;
  saldoSimulado?: number;
  className?: string;
}

export const SaldoGauge: React.FC<SaldoGaugeProps> = ({
  saldoAtual,
  meta,
  saldoSimulado,
  className = ''
}) => {
  const saldoParaAnalise = saldoSimulado !== undefined ? saldoSimulado : saldoAtual;
  
  // Calcular status baseado na meta
  const getStatus = (saldo: number) => {
    if (saldo < meta) return 'excedido';
    if (saldo <= meta * 1.1) return 'proximo'; // Até 10% acima da meta
    return 'confortavel';
  };

  const status = getStatus(saldoParaAnalise);
  
  // Configurações visuais baseadas no status
  const statusConfig = {
    confortavel: {
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      message: 'Saldo confortável!',
      description: 'Você está bem acima da sua meta de saldo.'
    },
    proximo: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: AlertTriangle,
      message: 'Próximo do limite',
      description: 'Cuidado! Você está próximo da sua meta mínima.'
    },
    excedido: {
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: TrendingDown,
      message: 'Meta excedida!',
      description: 'Seu saldo está abaixo da meta estabelecida.'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Calcular porcentagem para a barra
  const maxValue = Math.max(saldoParaAnalise, meta * 1.5);
  const porcentagemSaldo = Math.max((saldoParaAnalise / maxValue) * 100, 5);
  const porcentagemMeta = (meta / maxValue) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className={`w-6 h-6 ${config.textColor}`} />
          <div>
            <h3 className={`text-lg font-semibold ${config.textColor}`}>
              {config.message}
            </h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>
        {saldoSimulado !== undefined && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {saldoSimulado > saldoAtual ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span>Simulação</span>
          </div>
        )}
      </div>

      {/* Barra de progresso */}
      <div className="space-y-4">
        <div className="relative">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Saldo Atual</span>
            <span>Meta: {formatCurrency(meta)}</span>
          </div>
          
          <div className="h-6 bg-gray-200 rounded-full relative overflow-hidden">
            {/* Barra do saldo */}
            <div
              className={`h-full ${config.color} transition-all duration-500 ease-out`}
              style={{ width: `${porcentagemSaldo}%` }}
            />
            
            {/* Linha da meta */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-gray-700 border-l-2 border-gray-800"
              style={{ left: `${porcentagemMeta}%` }}
            >
              <div className="absolute -top-6 -left-8 text-xs bg-gray-800 text-white px-2 py-1 rounded">
                Meta
              </div>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">
              {saldoSimulado !== undefined ? 'Saldo Atual' : 'Saldo'}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(saldoAtual)}
            </p>
          </div>
          {saldoSimulado !== undefined && (
            <div>
              <p className="text-sm text-gray-600">Após Simulação</p>
              <p className={`text-lg font-bold ${config.textColor}`}>
                {formatCurrency(saldoSimulado)}
              </p>
            </div>
          )}
        </div>

        {/* Diferença da meta */}
        <div className="text-center pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600">Diferença da Meta</p>
          <p className={`text-xl font-bold ${saldoParaAnalise >= meta ? 'text-green-600' : 'text-red-600'}`}>
            {saldoParaAnalise >= meta ? '+' : ''}{formatCurrency(saldoParaAnalise - meta)}
          </p>
        </div>
      </div>
    </div>
  );
};
