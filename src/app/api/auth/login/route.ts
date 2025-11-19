import { NextRequest, NextResponse } from 'next/server';
import { validarSenha } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();
    const corretor = validarSenha(email, senha);
    
    if (corretor) {
      return NextResponse.json({ corretor }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 });
  }
}
