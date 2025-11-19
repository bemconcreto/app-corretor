'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2 } from 'lucide-react';
import { toast } from 'sonner';

type EtapaCompletar = 'dados-basicos' | 'verificacao-telefone' | 'concluido';

export default function CompletarCadastroPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState<EtapaCompletar>('dados-basicos');
  const [idCorretor, setIdCorretor] = useState('');
  
  const [formData, setFormData] = useState({
    telefone: '',
    cpf: '',
    endereco: '',
    rede_social: '',
    creci: '',
  });

  const [codigoTelefone, setCodigoTelefone] = useState('');
  const [codigoDevTelefone, setCodigoDevTelefone] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitDados = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enviar código para telefone
      const response = await fetch('/api/verificacao/enviar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          tipo: 'telefone',
          dadosCadastro: {
            ...formData,
            nome: session?.user?.name,
            email: session?.user?.email,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCodigoDevTelefone(data.codigo_dev);
        toast.success('Código enviado para seu celular!');
        setEtapa('verificacao-telefone');
      } else {
        toast.error('Erro ao enviar código. Tente novamente.');
      }
    } catch (error) {
      toast.error('Erro ao processar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarTelefone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/verificacao/validar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          codigo: codigoTelefone,
          tipo: 'telefone',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Completar cadastro
        const responseCompletar = await fetch('/api/auth/completar-cadastro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            corretor_id: (session?.user as any)?.id,
            dados: {
              ...formData,
              telefone_verificado: true,
              id_corretor: data.corretor.id_corretor,
            },
          }),
        });

        if (responseCompletar.ok) {
          const dataCompletar = await responseCompletar.json();
          setIdCorretor(dataCompletar.corretor.id_corretor);
          toast.success('Cadastro concluído com sucesso!');
          setEtapa('concluido');
        }
      } else {
        toast.error('Código inválido ou expirado.');
      }
    } catch (error) {
      toast.error('Erro ao verificar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101820]">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  // Tela de cadastro concluído
  if (etapa === 'concluido') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#101820]">
        <div className="w-full max-w-md text-center space-y-6">
          <Building2 className="w-20 h-20 text-[#A67C68] mx-auto" />
          <h1 className="text-3xl font-bold text-white">
            Cadastro Concluído!
          </h1>
          <div className="bg-[#56423B] p-6 rounded-lg border border-[#4C3B34]">
            <p className="text-gray-300 mb-4">
              Seu ID de Corretor foi criado com sucesso. Use este ID nas vendas para ganhar comissões.
            </p>
            <div className="bg-[#101820] p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Seu ID:</p>
              <p className="text-2xl font-bold text-[#A67C68]">{idCorretor}</p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full h-12 bg-[#A67C68] hover:bg-[#8B6654] text-white font-semibold"
          >
            Ir para o Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Tela de verificação de telefone
  if (etapa === 'verificacao-telefone') {
    return (
      <div className="flex flex-col min-h-screen bg-[#101820]">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center gap-4 mb-8">
              <Building2 className="w-12 h-12 text-[#A67C68]" strokeWidth={1.5} />
              <h1 className="text-3xl font-bold text-white">Verificar Celular</h1>
              <p className="text-gray-400 text-center">
                Digite o código de 6 dígitos enviado para {formData.telefone}
              </p>
              {codigoDevTelefone && (
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 mt-2">
                  <p className="text-yellow-300 text-sm font-semibold">
                    [DEV] Código: {codigoDevTelefone}
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleVerificarTelefone} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="codigoTelefone" className="text-gray-300">
                  Código de Verificação
                </Label>
                <Input
                  id="codigoTelefone"
                  type="text"
                  placeholder="000000"
                  value={codigoTelefone}
                  onChange={(e) => setCodigoTelefone(e.target.value)}
                  required
                  maxLength={6}
                  className="h-12 bg-[#56423B] border-[#4C3B34] text-white placeholder:text-gray-500 text-center text-2xl tracking-widest"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || codigoTelefone.length !== 6}
                className="w-full h-12 text-lg bg-[#A67C68] hover:bg-[#8B6654] text-white font-semibold"
              >
                {loading ? 'Verificando...' : 'Verificar e Concluir'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Tela de dados básicos
  return (
    <div className="flex flex-col min-h-screen bg-[#101820]">
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center gap-4 mb-8">
            <Building2 className="w-12 h-12 text-[#A67C68]" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold text-white">Completar Cadastro</h1>
            <p className="text-gray-400 text-center">
              Olá, {session?.user?.name}! Complete seus dados para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmitDados} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-gray-300">
                Telefone *
              </Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
                placeholder="(00) 00000-0000"
                className="h-12 bg-[#56423B] border-[#4C3B34] text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-gray-300">
                CPF *
              </Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                placeholder="000.000.000-00"
                className="h-12 bg-[#56423B] border-[#4C3B34] text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco" className="text-gray-300">
                Endereço *
              </Label>
              <Textarea
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                required
                rows={3}
                className="bg-[#56423B] border-[#4C3B34] text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rede_social" className="text-gray-300">
                Rede Social *
              </Label>
              <Input
                id="rede_social"
                name="rede_social"
                value={formData.rede_social}
                onChange={handleChange}
                required
                placeholder="@seu_instagram"
                className="h-12 bg-[#56423B] border-[#4C3B34] text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creci" className="text-gray-300">
                CRECI (opcional)
              </Label>
              <Input
                id="creci"
                name="creci"
                value={formData.creci}
                onChange={handleChange}
                placeholder="CRECI 00000"
                className="h-12 bg-[#56423B] border-[#4C3B34] text-white placeholder:text-gray-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg bg-[#A67C68] hover:bg-[#8B6654] text-white font-semibold mt-6"
            >
              {loading ? 'Processando...' : 'Continuar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
