'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CadastrarImovelPage() {
  const { corretor } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fotos, setFotos] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    cidade: '',
    estado: '',
    preco: '',
    descricao: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulação de upload - em produção usar storage real
      const newFotos = Array.from(files).map(file => URL.createObjectURL(file));
      setFotos([...fotos, ...newFotos]);
    }
  };

  const removerFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!corretor) return;
    
    setLoading(true);

    try {
      const response = await fetch('/api/imoveis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preco: parseFloat(formData.preco),
          corretor_id: corretor.id,
          fotos,
        }),
      });

      if (response.ok) {
        toast.success('Imóvel cadastrado com sucesso!');
        router.push('/dashboard');
      } else {
        toast.error('Erro ao cadastrar imóvel. Tente novamente.');
      }
    } catch (error) {
      toast.error('Erro ao cadastrar imóvel. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-white mb-6">Cadastrar Imóvel</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#56423B] p-6 rounded-lg border border-[#4C3B34] space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-gray-300">
                Nome do Imóvel *
              </Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Ex: Apartamento 3 quartos Centro"
                className="h-12 bg-[#101820] border-[#4C3B34] text-white placeholder:text-gray-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-gray-300">
                  Cidade *
                </Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  required
                  className="h-12 bg-[#101820] border-[#4C3B34] text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado" className="text-gray-300">
                  Estado *
                </Label>
                <Input
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                  placeholder="Ex: SP"
                  className="h-12 bg-[#101820] border-[#4C3B34] text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco" className="text-gray-300">
                Preço (R$) *
              </Label>
              <Input
                id="preco"
                name="preco"
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={handleChange}
                required
                placeholder="0.00"
                className="h-12 bg-[#101820] border-[#4C3B34] text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-gray-300">
                Descrição *
              </Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Descreva as características do imóvel..."
                className="bg-[#101820] border-[#4C3B34] text-white placeholder:text-gray-500"
              />
            </div>

            {/* Upload de Fotos */}
            <div className="space-y-2">
              <Label className="text-gray-300">Fotos</Label>
              <div className="border-2 border-dashed border-[#4C3B34] rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFotoUpload}
                  className="hidden"
                  id="foto-upload"
                />
                <label
                  htmlFor="foto-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-[#A67C68]" />
                  <p className="text-gray-400">Clique para adicionar fotos</p>
                </label>
              </div>

              {/* Preview das Fotos */}
              {fotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {fotos.map((foto, index) => (
                    <div key={index} className="relative">
                      <img
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removerFoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-lg bg-[#A67C68] hover:bg-[#8B6654] text-white font-semibold"
          >
            {loading ? 'Salvando...' : 'Salvar Imóvel'}
          </Button>
        </form>
      </div>
    </div>
  );
}
