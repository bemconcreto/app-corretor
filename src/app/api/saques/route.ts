import { NextRequest, NextResponse } from 'next/server';
import { criarSaque, buscarCorretorPorId, validarSenha } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { corretor_id, valor, senha } = await request.json();

    if (!corretor_id || !valor || !senha) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const corretor = buscarCorretorPorId(corretor_id);

    if (!corretor) {
      return NextResponse.json(
        { error: 'Corretor não encontrado' },
        { status: 404 }
      );
    }

    // Validar senha
    const senhaValida = validarSenha(corretor.email, senha);
    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // Verificar se tem dados bancários
    if (!corretor.dados_bancarios) {
      return NextResponse.json(
        { error: 'Cadastre seus dados bancários primeiro' },
        { status: 400 }
      );
    }

    // Verificar saldo
    if (valor > corretor.saldo_disponivel) {
      return NextResponse.json(
        { error: 'Saldo insuficiente' },
        { status: 400 }
      );
    }

    // Criar saque usando a chave PIX dos dados bancários
    const saque = criarSaque({
      corretor_id,
      valor,
      pix: corretor.dados_bancarios.chave_pix,
    });

    return NextResponse.json({ 
      success: true,
      saque 
    });
  } catch (error) {
    console.error('Erro ao criar saque:', error);
    return NextResponse.json(
      { error: 'Erro ao criar saque' },
      { status: 500 }
    );
  }
}
