import { NextRequest, NextResponse } from 'next/server';
import { salvarCodigoVerificacao } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, tipo, dadosCadastro } = await request.json();
    
    const codigo = salvarCodigoVerificacao(email, tipo, dadosCadastro);
    
    // Simulação de envio (em produção, integrar com serviço de e-mail/SMS)
    console.log(`Código ${tipo} para ${email}: ${codigo}`);
    
    // Em produção, aqui você enviaria o código por e-mail ou SMS
    // Para o MVP, vamos apenas retornar sucesso
    
    return NextResponse.json({ 
      success: true, 
      message: `Código enviado para ${tipo === 'email' ? 'e-mail' : 'celular'}`,
      // APENAS PARA DESENVOLVIMENTO - REMOVER EM PRODUÇÃO
      codigo_dev: codigo
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao enviar código' }, { status: 500 });
  }
}
