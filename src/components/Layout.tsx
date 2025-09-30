import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  PlusIcon, 
  MinusIcon, 
  TrendingUpIcon, 
  BarChart3Icon,
  LogOutIcon,
  Target
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Gestão Financeira</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="w-64 bg-white rounded-lg shadow-sm p-6">
            <nav className="space-y-2">
              <Link 
                to="/dashboard" 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/dashboard') 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <HomeIcon className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              <Link 
                to="/receitas" 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/receitas') 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <PlusIcon className="w-5 h-5 mr-3" />
                Receitas
              </Link>
              <Link 
                to="/despesas" 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/despesas') 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <MinusIcon className="w-5 h-5 mr-3" />
                Despesas
              </Link>
              <Link 
                to="/investimentos" 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/investimentos') 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <TrendingUpIcon className="w-5 h-5 mr-3" />
                Investimentos
              </Link>
              <Link 
                to="/meta-saldo" 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/meta-saldo') 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Target className="w-5 h-5 mr-3" />
                Meta de Saldo
              </Link>
              <Link 
                to="/relatorios" 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/relatorios') 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3Icon className="w-5 h-5 mr-3" />
                Relatórios
              </Link>
            </nav>
          </aside>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
