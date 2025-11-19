import { NextRequest, NextResponse } from 'next/server';
import { atualizarCorretor } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { corretor_id, dados_bancarios } = await request.json();

    if (!corretor_id || !dados_bancarios) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Validar campos obrigatórios
    const camposObrigatorios = ['nome_completo', 'cpf', 'banco', 'codigo_banco', 'agencia', 'conta', 'chave_pix'];
    for (const campo of camposObrigatorios) {
      if (!dados_bancarios[campo]) {
        return NextResponse.json(
          { error: `Campo ${campo} é obrigatório` },
          { status: 400 }
        );
      }
    }

    const corretor = atualizarCorretor(corretor_id, { dados_bancarios });

    if (!corretor) {
      return NextResponse.json(
        { error: 'Corretor não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      corretor 
    });
  } catch (error) {
    console.error('Erro ao salvar dados bancários:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar dados bancários' },
      { status: 500 }
    );
  }
}
