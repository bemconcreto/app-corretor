import { NextRequest, NextResponse } from 'next/server';
import { criarImovel } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const imovel = criarImovel(data);
    return NextResponse.json({ imovel }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar imóvel' }, { status: 500 });
  }
}
