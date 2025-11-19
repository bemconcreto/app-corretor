'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function PerfilPage() {
  const router = useRouter();
  const { corretor, logout } = useAuth();
  const [mostrarFormSenha, setMostrarFormSenha] = useState(false);
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCriarSenha = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/criar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corretor_id: corretor?.id,
          senha,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setMostrarFormSenha(false);
        setSenha('');
        setConfirmarSenha('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar senha.');
      }
    } catch (error) {
      toast.error('Erro ao criar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const temSenha = corretor?.senha && corretor.senha.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#101820]">
      {/* Header */}
      <div className="p-4 border-b border-[#4C3B34]">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Cabeçalho */}
          <div className="flex flex-col items-center gap-4">
            <Building2 className="w-12 h-12 text-[#A67C68]" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
          </div>

          {/* Informações do Corretor */}
          <div className="bg-[#56423B] rounded-lg p-6 border border-[#4C3B34] space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Dados Pessoais</h2>
            
            <div>
              <p className="text-sm text-gray-400">Nome</p>
              <p className="text-white font-medium">{corretor?.nome}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">E-mail</p>
              <p className="text-white font-medium">{corretor?.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Telefone</p>
              <p className="text-white font-medium">{corretor?.telefone}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">ID de Corretor</p>
              <p className="text-[#A67C68] font-bold text-lg">{corretor?.id_corretor}</p>
            </div>
          </div>

          {/* Seção de Senha */}
          <div className="bg-[#56423B] rounded-lg p-6 border border-[#4C3B34]">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-[#A67C68]" />
              <h2 className="text-xl font-semibold text-white">Segurança</h2>
            </div>

            {!temSenha && !mostrarFormSenha && (
              <div className="space-y-4">
                <p className="text-gray-300">
                  Você entrou usando sua conta Google. Crie uma senha para também poder fazer login com e-mail e senha.
                </p>
                <Button
                  onClick={() => setMostrarFormSenha(true)}
                  className="bg-[#A67C68] hover:bg-[#8B6654] text-white"
                >
                  Criar Senha
                </Button>
              </div>
            )}

            {temSenha && (
              <div className="space-y-2">
                <p className="text-green-400 font-medium">✓ Senha configurada</p>
                <p className="text-gray-300 text-sm">
                  Você pode fazer login usando e-mail e senha ou continuar usando o Google.
                </p>
              </div>
            )}

            {mostrarFormSenha && (
              <form onSubmit={handleCriarSenha} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senha" className="text-gray-300">
                    Nova Senha *
                  </Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={mostrarSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres"
                      className="h-12 bg-[#101820] border-[#4C3B34] text-white placeholder:text-gray-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {mostrarSenha ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha" className="text-gray-300">
                    Confirmar Senha *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={mostrarConfirmarSenha ? 'text' : 'password'}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                      placeholder="Digite a senha novamente"
                      className="h-12 bg-[#101820] border-[#4C3B34] text-white placeholder:text-gray-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {mostrarConfirmarSenha ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#A67C68] hover:bg-[#8B6654] text-white"
                  >
                    {loading ? 'Salvando...' : 'Salvar Senha'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMostrarFormSenha(false);
                      setSenha('');
                      setConfirmarSenha('');
                    }}
                    className="border-[#4C3B34] text-gray-300 hover:bg-[#4C3B34]"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Botão Sair */}
          <Button
            onClick={logout}
            variant="outline"
            className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}
