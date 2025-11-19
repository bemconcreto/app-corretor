import { NextRequest, NextResponse } from 'next/server';

// Simulação de banco de dados (compartilhado entre rotas)
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
    const { email, nome, google_id } = await request.json();

    if (!email || !nome) {
      return NextResponse.json(
        { error: 'Email e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o corretor já existe (por email)
    let corretor = corretores.find((c) => c.email === email);

    if (corretor) {
      // Corretor já existe - fazer login
      
      // Atualizar google_id se não existir
      if (!corretor.google_id) {
        corretor.google_id = google_id;
      }

      // Verificar se o cadastro está completo
      const cadastroCompleto = corretor.telefone && 
                               corretor.cpf && 
                               corretor.endereco && 
                               corretor.telefone_verificado &&
                               corretor.id_corretor;

      if (!cadastroCompleto) {
        // Marcar que precisa completar cadastro
        corretor.needs_completion = true;
      } else {
        corretor.needs_completion = false;
      }
      
      return NextResponse.json({ 
        corretor,
        isNewUser: false,
        needsCompletion: corretor.needs_completion
      });
    }

    // Criar novo corretor com dados básicos do Google
    const novoCorretor = {
      id: `corretor_${Date.now()}`,
      nome,
      email,
      google_id,
      telefone: '', // Será solicitado na tela de completar cadastro
      cpf: '',
      endereco: '',
      rede_social: '',
      creci: '', // Opcional
      senha: '', // Não tem senha (login via Google)
      id_corretor: '', // Será gerado após verificação de telefone
      saldo_disponivel: 0,
      saldo_pendente: 0,
      email_verificado: true, // Email já verificado pelo Google
      telefone_verificado: false,
      created_at: new Date().toISOString(),
      needs_completion: true, // Flag para indicar que precisa completar cadastro
    };

    corretores.push(novoCorretor);

    return NextResponse.json({ 
      corretor: novoCorretor,
      isNewUser: true,
      needsCompletion: true
    });
  } catch (error) {
    console.error('Erro ao processar login com Google:', error);
    return NextResponse.json(
      { error: 'Erro ao processar login com Google' },
      { status: 500 }
    );
  }
}

// Exportar array de corretores para ser usado em outras rotas
export { corretores };
