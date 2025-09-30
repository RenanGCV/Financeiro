import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Dashboard } from './pages/Dashboard';
import { Receitas } from './pages/Receitas';
import { Despesas } from './pages/Despesas';
import { Investimentos } from './pages/Investimentos';
import { Relatorios } from './pages/Relatorios';
import { MetaSaldo } from './pages/MetaSaldo';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/cadastro" element={user ? <Navigate to="/dashboard" /> : <Cadastro />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="receitas" element={<Receitas />} />
        <Route path="despesas" element={<Despesas />} />
        <Route path="investimentos" element={<Investimentos />} />
        <Route path="meta-saldo" element={<MetaSaldo />} />
        <Route path="relatorios" element={<Relatorios />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
