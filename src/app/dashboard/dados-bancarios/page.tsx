'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, ArrowLeft, Save, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { DadosBancarios } from '@/lib/types';

export default function DadosBancariosPage() {
  const { corretor, isAuthenticated, atualizarDadosBancarios } = useAuth();
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [dados, setDados] = useState<DadosBancarios>({
    nome_completo: '',
    cpf: '',
    banco: '',
    codigo_banco: '',
    agencia: '',
    conta: '',
    chave_pix: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (corretor?.dados_bancarios) {
      setDados(corretor.dados_bancarios);
    } else {
      setEditando(true);
    }
  }, [isAuthenticated, corretor, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!dados.nome_completo || !dados.cpf || !dados.banco || !dados.codigo_banco || 
        !dados.agencia || !dados.conta || !dados.chave_pix) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/corretores/dados-bancarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corretor_id: corretor?.id,
          dados_bancarios: dados,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        atualizarDadosBancarios(dados);
        setEditando(false);
        toast.success('Dados bancários salvos com sucesso!');
      } else {
        toast.error('Erro ao salvar dados bancários');
      }
    } catch (error) {
      toast.error('Erro ao salvar dados bancários');
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
            <h1 className="text-xl font-bold text-white">Meus Dados Bancários</h1>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-[#56423B] p-6 rounded-lg border border-[#4C3B34]">
          {!editando && corretor.dados_bancarios ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Nome Completo</p>
                  <p className="text-white font-semibold">{dados.nome_completo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">CPF</p>
                  <p className="text-white font-semibold">{dados.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Banco</p>
                  <p className="text-white font-semibold">{dados.banco}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Código do Banco</p>
                  <p className="text-white font-semibold">{dados.codigo_banco}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Agência</p>
                  <p className="text-white font-semibold">{dados.agencia}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Conta</p>
                  <p className="text-white font-semibold">{dados.conta}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-400">Chave PIX</p>
                  <p className="text-white font-semibold">{dados.chave_pix}</p>
                </div>
              </div>

              <Button
                onClick={() => setEditando(true)}
                className="w-full bg-[#A67C68] hover:bg-[#8B6654] text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Dados Bancários
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome_completo" className="text-gray-300">
                    Nome Completo *
                  </Label>
                  <Input
                    id="nome_completo"
                    value={dados.nome_completo}
                    onChange={(e) => setDados({ ...dados, nome_completo: e.target.value })}
                    className="bg-[#101820] border-[#4C3B34] text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cpf" className="text-gray-300">
                    CPF *
                  </Label>
                  <Input
                    id="cpf"
                    value={dados.cpf}
                    onChange={(e) => setDados({ ...dados, cpf: e.target.value })}
                    className="bg-[#101820] border-[#4C3B34] text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="banco" className="text-gray-300">
                    Banco *
                  </Label>
                  <Input
                    id="banco"
                    value={dados.banco}
                    onChange={(e) => setDados({ ...dados, banco: e.target.value })}
                    className="bg-[#101820] border-[#4C3B34] text-white"
                    placeholder="Ex: Banco do Brasil"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="codigo_banco" className="text-gray-300">
                    Código do Banco *
                  </Label>
                  <Input
                    id="codigo_banco"
                    value={dados.codigo_banco}
                    onChange={(e) => setDados({ ...dados, codigo_banco: e.target.value })}
                    className="bg-[#101820] border-[#4C3B34] text-white"
                    placeholder="Ex: 001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="agencia" className="text-gray-300">
                    Agência *
                  </Label>
                  <Input
                    id="agencia"
                    value={dados.agencia}
                    onChange={(e) => setDados({ ...dados, agencia: e.target.value })}
                    className="bg-[#101820] border-[#4C3B34] text-white"
                    placeholder="Ex: 1234-5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="conta" className="text-gray-300">
                    Conta *
                  </Label>
                  <Input
                    id="conta"
                    value={dados.conta}
                    onChange={(e) => setDados({ ...dados, conta: e.target.value })}
                    className="bg-[#101820] border-[#4C3B34] text-white"
                    placeholder="Ex: 12345-6"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="chave_pix" className="text-gray-300">
                    Chave PIX *
                  </Label>
                  <Input
                    id="chave_pix"
                    value={dados.chave_pix}
                    onChange={(e) => setDados({ ...dados, chave_pix: e.target.value })}
                    className="bg-[#101820] border-[#4C3B34] text-white"
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-[#A67C68] hover:bg-[#8B6654] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Dados
                </Button>
                {corretor.dados_bancarios && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDados(corretor.dados_bancarios!);
                      setEditando(false);
                    }}
                    className="border-[#4C3B34] text-gray-300 hover:bg-[#4C3B34]"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
