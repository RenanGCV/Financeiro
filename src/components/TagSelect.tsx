import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X } from 'lucide-react';

interface Tag {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
}

interface TagSelectProps {
  value?: string;
  onChange: (tagId: string | null) => void;
  tipo: 'receita' | 'despesa';
  placeholder?: string;
}

export const TagSelect: React.FC<TagSelectProps> = ({
  value,
  onChange,
  tipo,
  placeholder = 'Selecione uma tag...'
}) => {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    if (user) {
      fetchTags();
    }
  }, [user, tipo]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user?.id)
        .eq('tipo', tipo)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar tags:', error);
        return;
      }

      setTags(data || []);
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTag = async () => {
    if (!newTagName.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([
          {
            nome: newTagName.trim(),
            tipo,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar tag:', error);
        alert('Erro ao criar tag. Tente novamente.');
        return;
      }

      if (data) {
        setTags(prev => [...prev, data]);
        onChange(data.id);
        setNewTagName('');
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      alert('Erro ao criar tag. Tente novamente.');
    }
  };

  const options = tags.map(tag => ({
    value: tag.id,
    label: tag.nome
  }));

  const selectedOption = options.find(option => option.value === value) || null;

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#3B82F6'
      }
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#3B82F6' 
        : state.isFocused 
        ? '#EFF6FF' 
        : 'white',
      color: state.isSelected ? 'white' : '#374151'
    })
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            value={selectedOption}
            onChange={(option) => onChange(option?.value || null)}
            options={options}
            placeholder={placeholder}
            isClearable
            isSearchable
            styles={customStyles}
            noOptionsMessage={() => 'Nenhuma tag encontrada'}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          title="Criar nova tag"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {isCreating && (
        <div className="flex gap-2 p-3 bg-gray-50 rounded-md">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Nome da nova tag"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                createTag();
              }
            }}
            autoFocus
          />
          <button
            onClick={createTag}
            disabled={!newTagName.trim()}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            Criar
          </button>
          <button
            onClick={() => {
              setIsCreating(false);
              setNewTagName('');
            }}
            className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
