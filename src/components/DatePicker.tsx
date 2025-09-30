import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateForInput, formatDateForDisplay } from '../utils/currency';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  required?: boolean;
  maxDate?: string;
  className?: string;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  required = false,
  maxDate,
  className = '',
  placeholder = 'Selecione uma data'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      return new Date(value + 'T00:00:00');
    }
    return new Date();
  });

  const today = new Date();
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Dias do mês anterior (cinza)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDay = new Date(year, month, -i);
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected
      });
    }

    // Completar com dias do próximo mês se necessário
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = days.length; i < totalCells; i++) {
      const dayOfNextMonth: number = i - days.length + 1;
      const nextMonthDay: Date = new Date(year, month + 1, dayOfNextMonth);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectDate = (date: Date) => {
    const formattedDate = formatDateForInput(date);
    onChange(formattedDate);
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    if (maxDate) {
      const maxDateTime = new Date(maxDate + 'T23:59:59');
      return date > maxDateTime;
    }
    return false;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
        >
          <div className="flex items-center justify-between">
            <span className={value ? 'text-gray-900' : 'text-gray-500'}>
              {value ? formatDateForDisplay(value) : placeholder}
            </span>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
            {/* Header do calendário */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isDisabled = isDateDisabled(day.date);
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => !isDisabled && selectDate(day.date)}
                    disabled={isDisabled}
                    className={`
                      w-8 h-8 text-sm rounded-md transition-colors flex items-center justify-center
                      ${!day.isCurrentMonth 
                        ? 'text-gray-300 hover:text-gray-400' 
                        : isDisabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : day.isSelected
                        ? 'bg-blue-600 text-white font-semibold'
                        : day.isToday
                        ? 'bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Footer com botões */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => selectDate(today)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay para fechar o calendário */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
