import React from 'react';

export const DebugEnv: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Debug - Variáveis de Ambiente</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>VITE_SUPABASE_URL:</strong>{' '}
          <span className={supabaseUrl ? 'text-green-600' : 'text-red-600'}>
            {supabaseUrl ? '✅ Configurada' : '❌ Não encontrada'}
          </span>
        </div>
        <div>
          <strong>VITE_SUPABASE_ANON_KEY:</strong>{' '}
          <span className={supabaseKey ? 'text-green-600' : 'text-red-600'}>
            {supabaseKey ? '✅ Configurada' : '❌ Não encontrada'}
          </span>
        </div>
        {supabaseUrl && (
          <div>
            <strong>URL:</strong> <code className="bg-gray-200 px-1 rounded">{supabaseUrl}</code>
          </div>
        )}
        {supabaseKey && (
          <div>
            <strong>Key (primeiros 20 chars):</strong>{' '}
            <code className="bg-gray-200 px-1 rounded">{supabaseKey.substring(0, 20)}...</code>
          </div>
        )}
      </div>
    </div>
  );
};