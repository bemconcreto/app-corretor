'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, Clock } from 'lucide-react';
import { Comissao } from '@/lib/types';

export default function ComissoesPage() {
  const { corretor } = useAuth();
  const router = useRouter();
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (corretor) {
      fetch(`/api/comissoes?corretor_id=${corretor.id}`)
        .then(res => res.json())
        .then(data => {
          setComissoes(data.comissoes || []);
          setLoading(false);
        });
    }
  }, [corretor]);

  if (!corretor) return null;

  return (
    <div className="min-h-screen bg-[#101820]">
      {/* Header */}
      <div className="bg-[#56423B] border-b border-[#4C3B34] p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-white mb-6">Minhas Comissões</h1>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              <Clock className="w-6 h-6 text-gray-400" />
              <p className="text-sm text-gray-400">Saldo Pendente</p>
            </div>
            <p className="text-3xl font-bold text-gray-300">
              R$ {corretor.saldo_pendente.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Lista de Comissões */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Histórico</h2>
          
          {loading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : comissoes.length === 0 ? (
            <div className="bg-[#56423B] p-8 rounded-lg border border-[#4C3B34] text-center">
              <p className="text-gray-400">Nenhuma comissão registrada ainda.</p>
            </div>
          ) : (
            comissoes.map((comissao) => (
              <div
                key={comissao.id}
                className="bg-[#56423B] p-4 rounded-lg border border-[#4C3B34]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-400">Valor da Venda</p>
                    <p className="text-xl font-bold text-white">
                      R$ {comissao.venda_valor.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Comissão ({comissao.porcentagem}%)</p>
                    <p className="text-xl font-bold text-[#A67C68]">
                      R$ {comissao.valor_comissao.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      comissao.status === 'disponivel'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {comissao.status === 'disponivel' ? 'Disponível' : 'Pendente'}
                  </span>
                  {comissao.created_at && (
                    <p className="text-sm text-gray-500">
                      {new Date(comissao.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botão Solicitar Saque */}
        {corretor.saldo_disponivel > 0 && (
          <Button
            onClick={() => router.push('/dashboard/saques')}
            className="w-full h-12 mt-6 bg-[#A67C68] hover:bg-[#8B6654] text-white font-semibold"
          >
            Solicitar Saque
          </Button>
        )}
      </div>
    </div>
  );
}
