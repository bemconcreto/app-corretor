'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, ArrowLeft, Wallet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SaquesPage() {
  const { corretor, isAuthenticated } = useAuth();
  const router = useRouter();
  const [valor, setValor] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleContinuar = () => {
    if (!corretor?.dados_bancarios) {
      toast.error('Cadastre seus dados bancários primeiro');
      router.push('/dashboard/dados-bancarios');
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (!valor || valorNumerico <= 0) {
      toast.error('Informe um valor válido');
      return;
    }

    if (valorNumerico > corretor.saldo_disponivel) {
      toast.error('Saldo insuficiente');
      return;
    }

    setMostrarConfirmacao(true);
  };

  const handleConfirmarSaque = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senha) {
      toast.error('Digite sua senha para confirmar');
      return;
    }

    try {
      const response = await fetch('/api/saques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corretor_id: corretor?.id,
          valor: parseFloat(valor),
          senha,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Solicitação de saque enviada com sucesso!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Erro ao solicitar saque');
        setSenha('');
      }
    } catch (error) {
      toast.error('Erro ao solicitar saque');
      setSenha('');
    }
  };

  if (!corretor) return null;

  return (
    <div className="min-h-screen bg-[#101820]">
      {/* Header */}
      <div className="bg-[#56423B] border-b border-[#4C3B34] p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Building2 className="w-8 h-8 text-[#A67C68]" strokeWidth={1.5} />
            <h1 className="text-xl font-bold text-white">Solicitar Saque</h1>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Saldo Disponível */}
        <div className="bg-[#56423B] p-6 rounded-lg border border-[#4C3B34]">
          <p className="text-sm text-gray-400 mb-2">Saldo Disponível para Saque</p>
          <p className="text-3xl font-bold text-[#A67C68]">
            R$ {corretor.saldo_disponivel.toFixed(2)}
          </p>
        </div>

        {!mostrarConfirmacao ? (
          <>
            {/* Dados Bancários */}
            {corretor.dados_bancarios ? (
              <div className="bg-[#56423B] p-6 rounded-lg border border-[#4C3B34]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Conta para Saque</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/dados-bancarios')}
                    className="text-[#A67C68] hover:text-[#8B6654]"
                  >
                    Editar
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Banco:</span>
                    <span className="text-white font-semibold">
                      {corretor.dados_bancarios.banco} ({corretor.dados_bancarios.codigo_banco})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Agência:</span>
                    <span className="text-white font-semibold">{corretor.dados_bancarios.agencia}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conta:</span>
                    <span className="text-white font-semibold">{corretor.dados_bancarios.conta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">PIX:</span>
                    <span className="text-white font-semibold">{corretor.dados_bancarios.chave_pix}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#56423B] p-6 rounded-lg border border-[#4C3B34]">
                <div className="flex items-center gap-3 mb-4 text-yellow-500">
                  <AlertCircle className="w-6 h-6" />
                  <p className="font-semibold">Dados bancários não cadastrados</p>
                </div>
                <p className="text-gray-300 mb-4">
                  Você precisa cadastrar seus dados bancários antes de solicitar um saque.
                </p>
                <Button
                  onClick={() => router.push('/dashboard/dados-bancarios')}
                  className="w-full bg-[#A67C68] hover:bg-[#8B6654] text-white"
                >
                  Cadastrar Dados Bancários
                </Button>
              </div>
            )}

            {/* Valor do Saque */}
            {corretor.dados_bancarios && (
              <div className="bg-[#56423B] p-6 rounded-lg border border-[#4C3B34]">
                <Label htmlFor="valor" className="text-gray-300 text-lg mb-2 block">
                  Valor do Saque
                </Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  max={corretor.saldo_disponivel}
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  className="bg-[#101820] border-[#4C3B34] text-white text-2xl h-16 mb-4"
                />
                <Button
                  onClick={handleContinuar}
                  className="w-full bg-[#A67C68] hover:bg-[#8B6654] text-white h-14 text-lg"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Continuar
                </Button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleConfirmarSaque} className="space-y-6">
            {/* Confirmação */}
            <div className="bg-[#56423B] p-6 rounded-lg border border-[#4C3B34]">
              <h2 className="text-lg font-semibold text-white mb-4">Confirme os dados do saque</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor:</span>
                  <span className="text-white font-bold text-xl">R$ {parseFloat(valor).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Banco:</span>
                  <span className="text-white font-semibold">
                    {corretor.dados_bancarios?.banco} ({corretor.dados_bancarios?.codigo_banco})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conta:</span>
                  <span className="text-white font-semibold">
                    Ag: {corretor.dados_bancarios?.agencia} / Conta: {corretor.dados_bancarios?.conta}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#4C3B34] pt-4">
                <Label htmlFor="senha" className="text-gray-300 mb-2 block">
                  Digite sua senha para confirmar
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Senha de acesso"
                  className="bg-[#101820] border-[#4C3B34] text-white"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMostrarConfirmacao(false);
                  setSenha('');
                }}
                className="flex-1 border-[#4C3B34] text-gray-300 hover:bg-[#4C3B34]"
              >
                Voltar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#A67C68] hover:bg-[#8B6654] text-white"
              >
                Confirmar Saque
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
