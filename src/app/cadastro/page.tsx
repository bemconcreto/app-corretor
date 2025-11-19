'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type EtapaCadastro = 'formulario' | 'verificacao-email' | 'verificacao-telefone' | 'concluido';

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState<EtapaCadastro>('formulario');
  const [idCorretor, setIdCorretor] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: '',
    rede_social: '',
    creci: '',
    senha: '',
    confirmarSenha: '',
  });

  const [codigoEmail, setCodigoEmail] = useState('');
  const [codigoTelefone, setCodigoTelefone] = useState('');
  const [codigoDevEmail, setCodigoDevEmail] = useState('');
  const [codigoDevTelefone, setCodigoDevTelefone] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitFormulario = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar senhas
    if (formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (formData.senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      // Enviar código de verificação por e-mail
      const response = await fetch('/api/verificacao/enviar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          tipo: 'email',
          dadosCadastro: {
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
            cpf: formData.cpf,
            endereco: formData.endereco,
            rede_social: formData.rede_social,
            creci: formData.creci || undefined,
            senha: formData.senha,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCodigoDevEmail(data.codigo_dev); // APENAS PARA DESENVOLVIMENTO
        toast.success('Código enviado para seu e-mail!');
        setEtapa('verificacao-email');
      } else {
        toast.error('Erro ao enviar código. Tente novamente.');
      }
    } catch (error) {
      toast.error('Erro ao processar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/verificacao/validar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          codigo: codigoEmail,
          tipo: 'email',
        }),
      });

      if (response.ok) {
        toast.success('E-mail verificado com sucesso!');
        
        // Enviar código para telefone
        const responseTelefone = await fetch('/api/verificacao/enviar-codigo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            tipo: 'telefone',
            dadosCadastro: {
              nome: formData.nome,
              email: formData.email,
              telefone: formData.telefone,
              cpf: formData.cpf,
              endereco: formData.endereco,
              rede_social: formData.rede_social,
              creci: formData.creci || undefined,
              senha: formData.senha,
            },
          }),
        });

        if (responseTelefone.ok) {
          const dataTelefone = await responseTelefone.json();
          setCodigoDevTelefone(dataTelefone.codigo_dev); // APENAS PARA DESENVOLVIMENTO
          toast.success('Código enviado para seu celular!');
          setEtapa('verificacao-telefone');
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

  const handleVerificarTelefone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/verificacao/validar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          codigo: codigoTelefone,
          tipo: 'telefone',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIdCorretor(data.corretor.id_corretor);
        toast.success('Cadastro concluído com sucesso!');
        setEtapa('concluido');
      } else {
        toast.error('Código inválido ou expirado.');
      }
    } catch (error) {
      toast.error('Erro ao verificar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => router.push('/login')}
            className="w-full h-12 bg-[#A67C68] hover:bg-[#8B6654] text-white font-semibold"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  // Tela de verificação de telefone
  if (etapa === 'verificacao-telefone') {
    return (
      <div className="flex flex-col min-h-screen bg-[#101820]">
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={() => setEtapa('verificacao-email')}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </div>

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

  // Tela de verificação de e-mail
  if (etapa === 'verificacao-email') {
    return (
      <div className="flex flex-col min-h-screen bg-[#101820]">
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={() => setEtapa('formulario')}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center gap-4 mb-8">
              <Building2 className="w-12 h-12 text-[#A67C68]" strokeWidth={1.5} />
              <h1 className="text-3xl font-bold text-white">Verificar E-mail</h1>
              <p className="text-gray-400 text-center">
                Digite o código de 6 dígitos enviado para {formData.email}
              </p>
              {codigoDevEmail && (
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 mt-2">
                  <p className="text-yellow-300 text-sm font-semibold">
                    [DEV] Código: {codigoDevEmail}
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleVerificarEmail} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="codigoEmail" className="text-gray-300">
                  Código de Verificação
                </Label>
                <Input
                  id="codigoEmail"
                  type="text"
                  placeholder="000000"
                  value={codigoEmail}
                  onChange={(e) => setCodigoEmail(e.target.value)}
                  required
                  maxLength={6}
                  className="h-12 bg-[#56423B] border-[#4C3B34] text-white placeholder:text-gray-500 text-center text-2xl tracking-widest"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || codigoEmail.length !== 6}
                className="w-full h-12 text-lg bg-[#A67C68] hover:bg-[#8B6654] text-white font-semibold"
              >
                {loading ? 'Verificando...' : 'Verificar E-mail'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Tela de formulário inicial
  return (
    <div className="flex flex-col min-h-screen bg-[#101820]">
      {/* Header */}
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <Building2 className="w-12 h-12 text-[#A67C68]" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold text-white">Criar Cadastro</h1>
            <p className="text-gray-400 text-center">
              Preencha seus dados para começar
            </p>
          </div>

          {/* Botão Cadastrar com Google - MOVIDO PARA O TOPO */}
          <Button
            type="button"
            onClick={() => signIn('google')}
            disabled={loading}
            className="w-full h-12 text-lg bg-white hover:bg-gray-100 text-gray-900 font-semibold border border-gray-300 mb-6"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Cadastrar com Google
          </Button>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#4C3B34]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#101820] text-gray-400">ou</span>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmitFormulario} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-gray-300">
                Nome Completo *
              </Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="h-12 bg-[#56423B] border-[#4C3B34] text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                E-mail *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12 bg-[#56423B] border-[#4C3B34] text-white placeholder:text-gray-500"
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-gray-300">
                Senha *
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  name="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="h-12 bg-[#56423B] border-[#4C3B34] text-white placeholder:text-gray-500 pr-12"
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
                  name="confirmarSenha"
                  type={mostrarConfirmarSenha ? 'text' : 'password'}
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
                  placeholder="Digite a senha novamente"
                  className="h-12 bg-[#56423B] border-[#4C3B34] text-white placeholder:text-gray-500 pr-12"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg bg-[#A67C68] hover:bg-[#8B6654] text-white font-semibold mt-6"
            >
              {loading ? 'Processando...' : 'Continuar'}
            </Button>
          </form>

          {/* Link para Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Já tem cadastro?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-[#A67C68] hover:underline font-semibold"
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
