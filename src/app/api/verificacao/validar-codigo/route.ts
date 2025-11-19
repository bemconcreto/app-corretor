import { NextRequest, NextResponse } from 'next/server';
import { verificarCodigo, limparCodigoVerificacao, criarCorretor } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, codigo, tipo } = await request.json();
    
    const resultado = verificarCodigo(email, codigo, tipo);
    
    if (!resultado.valido) {
      return NextResponse.json({ 
        error: 'Código inválido ou expirado' 
      }, { status: 400 });
    }
    
    // Se for verificação de telefone (última etapa), criar o corretor
    if (tipo === 'telefone' && resultado.dados_cadastro) {
      const corretor = criarCorretor(resultado.dados_cadastro);
      
      // Limpar códigos usados
      limparCodigoVerificacao(email, 'email');
      limparCodigoVerificacao(email, 'telefone');
      
      return NextResponse.json({ 
        success: true,
        corretor,
        message: 'Cadastro concluído com sucesso!'
      }, { status: 200 });
    }
    
    // Se for verificação de e-mail, apenas confirmar
    return NextResponse.json({ 
      success: true,
      message: 'Código verificado com sucesso!'
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao verificar código' }, { status: 500 });
  }
}
