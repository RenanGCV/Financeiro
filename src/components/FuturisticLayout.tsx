import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  PlusIcon, 
  MinusIcon, 
  TrendingUpIcon, 
  BarChart3Icon,
  LogOutIcon,
  Target,
  MenuIcon,
  XIcon,
  DollarSignIcon,
  Calendar
} from 'lucide-react';

export const FuturisticLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard', description: 'Visão geral' },
    { path: '/receitas', icon: PlusIcon, label: 'Receitas', description: 'Ganhos' },
    { path: '/despesas', icon: MinusIcon, label: 'Despesas', description: 'Gastos' },
    { path: '/investimentos', icon: TrendingUpIcon, label: 'Investimentos', description: 'Portfolio' },
    { path: '/meta-saldo', icon: Target, label: 'Meta de Saldo', description: 'Objetivos' },
    { path: '/calendario', icon: Calendar, label: 'Calendário', description: 'Projeção' },
    { path: '/relatorios', icon: BarChart3Icon, label: 'Relatórios', description: 'Análises' },
  ];

  return (
    <div className="flex h-screen bg-dark-primary overflow-hidden">
      {/* Sidebar */}
      <div className={`sidebar-futuristic transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'w-64' : 'w-20'
      } lg:w-64 flex-shrink-0 flex flex-col h-full`}>
        <div className="flex-1 p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-accent-orange rounded-xl flex items-center justify-center animate-pulse-glow">
              <DollarSignIcon className="w-6 h-6 text-dark-primary" />
            </div>
            <div className={`transition-opacity duration-300 ${sidebarOpen || 'lg:opacity-100' ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
              <h1 className="text-xl font-bold text-text-primary">FinanceIA</h1>
              <p className="text-xs text-text-muted">Gestão Inteligente</p>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-8 p-4 card-futuristic">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-gold/20 to-accent-orange/20 rounded-full flex items-center justify-center border border-accent-gold/30">
                <span className="text-sm font-semibold text-accent-gold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={`transition-opacity duration-300 ${sidebarOpen || 'lg:opacity-100' ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-text-muted">Premium User</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item group ${active ? 'active' : ''}`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${
                    active ? 'text-accent-gold' : 'text-text-muted group-hover:text-accent-gold'
                  }`} />
                  <div className={`ml-3 transition-opacity duration-300 ${
                    sidebarOpen || 'lg:opacity-100' ? 'opacity-100' : 'opacity-0 lg:opacity-100'
                  }`}>
                    <span className="text-sm font-medium">{item.label}</span>
                    <p className="text-xs text-text-muted">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-6 border-t border-dark-border">
          <button
            onClick={handleSignOut}
            className="nav-item w-full text-left group"
          >
            <LogOutIcon className="w-5 h-5 text-text-muted group-hover:text-red-400 transition-colors" />
            <div className={`ml-3 transition-opacity duration-300 ${
              sidebarOpen || 'lg:opacity-100' ? 'opacity-100' : 'opacity-0 lg:opacity-100'
            }`}>
              <span className="text-sm font-medium group-hover:text-red-400">Sair</span>
              <p className="text-xs text-text-muted">Logout seguro</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-dark-secondary border-b border-dark-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-dark-card border border-dark-border hover:bg-dark-cardHover transition-colors"
            >
              {sidebarOpen ? (
                <XIcon className="w-5 h-5 text-text-secondary" />
              ) : (
                <MenuIcon className="w-5 h-5 text-text-secondary" />
              )}
            </button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-text-secondary">Sistema Ativo</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm text-text-muted">Último acesso:</span>
                <span className="text-sm text-text-secondary">
                  {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-dark-primary">
          <div className="p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};