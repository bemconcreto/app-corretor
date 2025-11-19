'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-[#101820] to-[#56423B]">
      {/* Logo e Título */}
      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="flex items-center gap-3">
          <Building2 className="w-16 h-16 text-[#A67C68]" strokeWidth={1.5} />
          <h1 className="text-5xl font-bold text-white font-geist-sans">
            Bem Concreto
          </h1>
        </div>
        <p className="text-lg text-center text-gray-300 max-w-md">
          Corretor, esse é o seu canal para acompanhar as suas vendas e comissões. É hora de vender um Bem Concreto!!!
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button
          onClick={() => router.push('/login')}
          size="lg"
          className="w-full h-14 text-lg bg-[#A67C68] hover:bg-[#8B6654] text-white font-semibold"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Entrar
        </Button>
        
        <Button
          onClick={() => router.push('/cadastro')}
          size="lg"
          variant="outline"
          className="w-full h-14 text-lg border-2 border-[#A67C68] text-[#A67C68] hover:bg-[#A67C68] hover:text-white font-semibold"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Criar Cadastro
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-16 text-sm text-gray-400">
        App do Corretor — Versão 1.0
      </div>
    </div>
  );
}
