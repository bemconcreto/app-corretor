'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Corretor, DadosBancarios } from '@/lib/types';

interface AuthContextType {
  corretor: Corretor | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  atualizarDadosBancarios: (dados: DadosBancarios) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [corretor, setCorretor] = useState<Corretor | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se há sessão do NextAuth (login com Google)
    if (session?.user) {
      const user = session.user as any;
      
      // Verificar se precisa completar cadastro
      if (user.needs_completion && pathname !== '/completar-cadastro') {
        // Redirecionar para completar cadastro
        router.push('/completar-cadastro');
        return;
      }

      // Usuário já tem cadastro completo
      if (!user.needs_completion) {
        setCorretor(user as Corretor);
        localStorage.setItem('corretor', JSON.stringify(user));
      }
    } else if (status === 'unauthenticated') {
      // Verificar se há sessão salva (login tradicional)
      const savedCorretor = localStorage.getItem('corretor');
      if (savedCorretor) {
        setCorretor(JSON.parse(savedCorretor));
      }
    }
  }, [session, status, pathname, router]);

  const login = async (email: string, senha: string): Promise<boolean> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    if (response.ok) {
      const data = await response.json();
      setCorretor(data.corretor);
      localStorage.setItem('corretor', JSON.stringify(data.corretor));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCorretor(null);
    localStorage.removeItem('corretor');
    
    // Se estava usando NextAuth, fazer signOut
    if (session) {
      import('next-auth/react').then(({ signOut }) => {
        signOut({ callbackUrl: '/login' });
      });
    } else {
      window.location.href = '/login';
    }
  };

  const atualizarDadosBancarios = (dados: DadosBancarios) => {
    if (corretor) {
      const corretorAtualizado = { ...corretor, dados_bancarios: dados };
      setCorretor(corretorAtualizado);
      localStorage.setItem('corretor', JSON.stringify(corretorAtualizado));
    }
  };

  return (
    <AuthContext.Provider value={{ corretor, login, logout, atualizarDadosBancarios, isAuthenticated: !!corretor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
