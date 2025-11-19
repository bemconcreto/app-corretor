import { NextRequest, NextResponse } from 'next/server';
import { buscarComissoesPorCorretor } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const corretor_id = searchParams.get('corretor_id');
    
    if (!corretor_id) {
      return NextResponse.json({ error: 'corretor_id é obrigatório' }, { status: 400 });
    }
    
    const comissoes = buscarComissoesPorCorretor(corretor_id);
    return NextResponse.json({ comissoes }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar comissões' }, { status: 500 });
  }
}
