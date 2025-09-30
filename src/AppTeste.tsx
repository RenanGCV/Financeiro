import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componente simples de login mock para testar
const MockLogin: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('🚨 Esta é uma versão de teste!\n\nPara funcionar de verdade, corrija a chave do Supabase no arquivo .env');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            🎯 Gestão Financeira
          </h2>
          <p className="mt-2 text-center text-sm text-red-600">
            ⚠️ Versão de teste - Corrija a chave do Supabase!
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Entrar (Teste)
            </button>
          </div>
        </form>
        
        <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
          <h3 className="font-bold text-yellow-800">📋 Para corrigir:</h3>
          <ol className="text-sm text-yellow-700 mt-2 space-y-1">
            <li>1. Vá para supabase.com</li>
            <li>2. Acesse seu projeto</li>
            <li>3. Settings → API</li>
            <li>4. Copie a chave anon COMPLETA</li>
            <li>5. Cole no arquivo .env</li>
            <li>6. Execute o SQL do database.sql</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

function AppTeste() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<MockLogin />} />
      </Routes>
    </Router>
  );
}

export default AppTeste;
