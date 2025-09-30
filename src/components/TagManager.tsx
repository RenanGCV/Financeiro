import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Tag } from '../types';
import { TagIcon, PlusIcon, TrashIcon } from 'lucide-react';

interface TagManagerProps {
  tipo: 'receita' | 'despesa';
  onTagsUpdate?: () => void;
}

export const TagManager: React.FC<TagManagerProps> = ({ tipo, onTagsUpdate }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTags();
    }
  }, [user, tipo]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user!.id)
        .eq('tipo', tipo)
        .order('nome');

      if (error) throw error;
      if (data) setTags(data);
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tags')
        .insert([
          {
            user_id: user!.id,
            nome: newTagName.trim(),
            tipo: tipo,
          }
        ]);

      if (error) throw error;

      setNewTagName('');
      setShowForm(false);
      fetchTags();
      if (onTagsUpdate) onTagsUpdate();
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      alert('Erro ao criar tag');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tag?')) {
      try {
        const { error } = await supabase
          .from('tags')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchTags();
        if (onTagsUpdate) onTagsUpdate();
      } catch (error) {
        console.error('Erro ao excluir tag:', error);
        alert('Erro ao excluir tag');
      }
    }
  };

  const tagColor = tipo === 'receita' ? 'green' : 'red';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Tags de {tipo === 'receita' ? 'Receitas' : 'Despesas'}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center px-3 py-1 text-sm bg-${tagColor}-600 text-white rounded hover:bg-${tagColor}-700`}
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Nova Tag
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateTag} className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Nome da tag"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setNewTagName('');
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
        </form>
      )}

      <div className="space-y-2">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
              <div className="flex items-center">
                <TagIcon className={`w-4 h-4 mr-2 text-${tagColor}-600`} />
                <span className="text-sm">{tag.nome}</span>
              </div>
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="text-red-600 hover:text-red-800"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">
            Nenhuma tag criada ainda. Crie tags para organizar suas {tipo === 'receita' ? 'receitas' : 'despesas'}.
          </p>
        )}
      </div>
    </div>
  );
};
