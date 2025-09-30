import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const QuickTest: React.FC = () => {
  const [result, setResult] = useState<string>('');

  const testAuth = async () => {
    setResult('🔍 Testando passo a passo...\n\n');
    
    try {
      // Teste 1: Verificar se consegue acessar auth
      setResult(prev => prev + '1️⃣ Testando acesso ao auth...\n');
      const { data: session } = await supabase.auth.getSession();
      setResult(prev => prev + `✅ Auth acessível: ${session ? 'Sim' : 'Não'}\n\n`);

      // Teste 2: Tentar signup simples sem trigger
      setResult(prev => prev + '2️⃣ Testando signup básico...\n');
      const testEmail = `teste.${Date.now()}@exemplo.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'teste123456',
        options: {
          data: {
            full_name: 'Teste Usuario'
          }
        }
      });

      if (error) {
        setResult(prev => prev + `❌ ERRO NO SIGNUP:\n`);
        setResult(prev => prev + `Mensagem: ${error.message}\n`);
        setResult(prev => prev + `Código: ${error.status}\n`);
        setResult(prev => prev + `Nome: ${error.name}\n\n`);
        
        // Teste 3: Verificar se é problema com triggers
        setResult(prev => prev + '3️⃣ Verificando triggers no Supabase...\n');
        try {
          const { data: functionsData, error: functionsError } = await supabase
            .rpc('version'); // Função básica que sempre existe
          
          if (functionsError) {
            setResult(prev => prev + `❌ Problema com funções: ${functionsError.message}\n`);
          } else {
            setResult(prev => prev + `✅ Funções funcionando\n`);
          }
        } catch (err) {
          setResult(prev => prev + `❌ Erro ao testar funções: ${err}\n`);
        }

        // Teste 4: Verificar configuração
        setResult(prev => prev + '\n4️⃣ POSSÍVEIS SOLUÇÕES:\n');
        setResult(prev => prev + `🔧 1. Vá no Supabase → Authentication → Settings\n`);
        setResult(prev => prev + `🔧 2. Verifique se "Enable email confirmations" está DESABILITADO\n`);
        setResult(prev => prev + `🔧 3. Ou adicione um redirect URL válido\n`);
        setResult(prev => prev + `🔧 4. Verifique se não há triggers problemáticos em Database → Functions\n`);
        
      } else {
        setResult(prev => prev + `✅ SUCESSO! Usuário criado:\n`);
        setResult(prev => prev + `Email: ${data.user?.email}\n`);
        setResult(prev => prev + `ID: ${data.user?.id}\n`);
        setResult(prev => prev + `Confirmado: ${data.user?.email_confirmed_at ? 'Sim' : 'Não'}\n`);
      }
    } catch (err) {
      setResult(prev => prev + `❌ ERRO JAVASCRIPT: ${err}\n`);
    }
  };

  const checkTables = async () => {
    setResult('Verificando tabelas...');
    
    try {
      const tables = ['tags', 'receitas', 'despesas', 'investimentos'];
      const results: string[] = [];
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*').limit(1);
          if (error) {
            results.push(`❌ ${table}: ${error.message}`);
          } else {
            results.push(`✅ ${table}: OK`);
          }
        } catch (err) {
          results.push(`❌ ${table}: ${err}`);
        }
      }
      
      setResult(results.join('\n'));
    } catch (err) {
      setResult(`❌ ERRO: ${err}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#fff',
      border: '2px solid #000',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '400px',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>🚨 TESTE RÁPIDO</h3>
      
      <button onClick={testAuth} style={{
        background: '#f44336',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        margin: '5px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        TESTAR CADASTRO
      </button>
      
      <button onClick={checkTables} style={{
        background: '#2196F3',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        margin: '5px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        VERIFICAR TABELAS
      </button>
      
      {result && (
        <pre style={{
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          marginTop: '10px',
          whiteSpace: 'pre-wrap',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {result}
        </pre>
      )}
    </div>
  );
};
