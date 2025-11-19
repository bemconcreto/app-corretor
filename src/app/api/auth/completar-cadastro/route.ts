import { NextRequest, NextResponse } from 'next/server';

// Simulação de banco de dados (compartilhado com google-login)
// Em produção, isso seria substituído por um banco de dados real
let corretores: any[] = [];

// Função para gerar próximo ID de corretor
function gerarProximoIdCorretor(): string {
  const ultimoId = corretores
    .filter(c => c.id_corretor)
    .map(c => parseInt(c.id_corretor.replace('BCTCR-', '')))
    .sort((a, b) => b - a)[0] || 0;
  
  const proximoNumero = ultimoId + 1;
  return `BCTCR-${String(proximoNumero).padStart(5, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const { corretor_id, dados } = await request.json();

    // Encontrar o corretor
    const corretor = corretores.find((c) => c.id === corretor_id);

    if (!corretor) {
      return NextResponse.json(
        { error: 'Corretor não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar dados do corretor
    Object.assign(corretor, dados);
    
    // Gerar ID de corretor se ainda não tiver e o telefone foi verificado
    if (!corretor.id_corretor && dados.telefone_verificado) {
      corretor.id_corretor = gerarProximoIdCorretor();
    }
    
    // Marcar cadastro como completo
    corretor.needs_completion = false;

    return NextResponse.json({ 
      success: true,
      corretor 
    });
  } catch (error) {
    console.error('Erro ao completar cadastro:', error);
    return NextResponse.json(
      { error: 'Erro ao completar cadastro' },
      { status: 500 }
    );
  }
}
