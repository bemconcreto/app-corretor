import { NextRequest, NextResponse } from 'next/server';
import { criarCorretor } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const corretor = criarCorretor(data);
    return NextResponse.json({ corretor }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar corretor' }, { status: 500 });
  }
}
