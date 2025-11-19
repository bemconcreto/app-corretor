'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Copy, 
  DollarSign, 
  Home as HomeIcon, 
  LogOut, 
  User,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { corretor, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!corretor) return null;

  const copiarMensagem = () => {
    const link = `https://bemconcreto.com.br/corretor/${corretor.id_corretor}`;
    const mensagem = `Olá, compre agora mesmo o seu BCT através do meu link: ${link}. Comece a lucrar agora mesmo com o mercado imobiliário!!`;
    navigator.clipboard.writeText(mensagem);
    toast.success('Mensagem copiada para a área de transferência!');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#101820]">
      {/* Header */}
      <div className="bg-[#56423B] border-b border-[#4C3B34] p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#A67C68]" strokeWidth={1.5} />
            <div>
              <h1 className="text-xl font-bold text-white">Bem Concreto</h1>
              <p className="text-sm text-gray-300">{corretor.nome}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-300 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Meu ID */}
        <div className="bg-[#56423B] p-6 rounded-lg border border-[#4C3B34]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Meu ID de Corretor</p>
              <p className="text-2xl font-bold text-[#A67C68]">{corretor.id_corretor}</p>
            </div>
            <Button
              onClick={copiarMensagem}
              className="bg-[#A67C68] hover:bg-[#8B6654] text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Mensagem
            </Button>
          </div>
        </div>

        {/* Saldos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#56423B] p-6 rounded-lg border border-[#4C3B34]">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-[#A67C68]" />
              <p className="text-sm text-gray-400">Saldo Disponível</p>
            </div>
            <p className="text-3xl font-bold text-white">
              R$ {corretor.saldo_disponivel.toFixed(2)}
            </p>
          </div>

          <div className="bg-[#56423B] p-6 rounded-lg border border-[#4C3B34]">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-6 h-6 text-gray-400" />
              <p className="text-sm text-gray-400">Saldo Pendente</p>
            </div>
            <p className="text-3xl font-bold text-gray-300">
              R$ {corretor.saldo_pendente.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Ações Rápidas - ORDEM ALTERADA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => router.push('/dashboard/comissoes')}
            size="lg"
            className="h-20 bg-[#A67C68] hover:bg-[#8B6654] text-white text-lg font-semibold"
          >
            <DollarSign className="w-6 h-6 mr-3" />
            Minhas Comissões
          </Button>

          <Button
            onClick={() => router.push('/dashboard/saques')}
            size="lg"
            variant="outline"
            className="h-20 border-2 border-[#A67C68] text-[#A67C68] hover:bg-[#A67C68] hover:text-white text-lg font-semibold"
          >
            <Wallet className="w-6 h-6 mr-3" />
            Solicitar Saque
          </Button>
        </div>

        <Button
          onClick={() => router.push('/dashboard/imoveis')}
          size="lg"
          variant="outline"
          className="w-full h-16 border-2 border-[#4C3B34] text-gray-300 hover:bg-[#56423B] hover:text-white text-lg font-semibold"
        >
          <HomeIcon className="w-6 h-6 mr-3" />
          Cadastrar Imóvel
        </Button>

        {/* Perfil */}
        <Button
          onClick={() => router.push('/dashboard/perfil')}
          variant="ghost"
          className="w-full text-gray-400 hover:text-white"
        >
          <User className="w-5 h-5 mr-2" />
          Meu Perfil
        </Button>
      </div>
    </div>
  );
}
