import { NextRequest, NextResponse } from 'next/server';

// Simulação de banco de dados (compartilhado)
let corretores: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { corretor_id, senha } = await request.json();

    // Encontrar o corretor
    const corretor = corretores.find((c) => c.id === corretor_id);

    if (!corretor) {
      return NextResponse.json(
        { error: 'Corretor não encontrado' },
        { status: 404 }
      );
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Adicionar senha ao corretor
    corretor.senha = senha;

    return NextResponse.json({ 
      success: true,
      message: 'Senha criada com sucesso! Agora você pode fazer login com e-mail e senha.' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar senha' },
      { status: 500 }
    );
  }
}
