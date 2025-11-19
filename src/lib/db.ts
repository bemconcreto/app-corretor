// Mock de dados para o MVP (substituir por Supabase depois)

import { Corretor, Imovel, Comissao, Saque, CodigoVerificacao } from './types';

// Simulação de banco de dados local
let corretores: Corretor[] = [];
let imoveis: Imovel[] = [];
let comissoes: Comissao[] = [];
let saques: Saque[] = [];
let codigosVerificacao: CodigoVerificacao[] = [];

// Gerar ID de corretor automático
export function gerarIdCorretor(): string {
  const numero = (corretores.length + 1).toString().padStart(5, '0');
  return `BCTCR-${numero}`;
}

// Gerar código de 6 dígitos
export function gerarCodigoVerificacao(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Códigos de verificação
export function salvarCodigoVerificacao(email: string, tipo: 'email' | 'telefone', dadosCadastro?: any): string {
  const codigo = gerarCodigoVerificacao();
  const expira_em = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutos
  
  // Remover códigos antigos do mesmo email e tipo
  codigosVerificacao = codigosVerificacao.filter(c => !(c.email === email && c.tipo === tipo));
  
  codigosVerificacao.push({
    email,
    codigo,
    tipo,
    expira_em,
    dados_cadastro: dadosCadastro,
  });
  
  return codigo;
}

export function verificarCodigo(email: string, codigo: string, tipo: 'email' | 'telefone'): { valido: boolean; dados_cadastro?: any } {
  const codigoSalvo = codigosVerificacao.find(
    c => c.email === email && c.codigo === codigo && c.tipo === tipo
  );
  
  if (!codigoSalvo) {
    return { valido: false };
  }
  
  // Verificar se expirou
  if (new Date(codigoSalvo.expira_em) < new Date()) {
    return { valido: false };
  }
  
  return { valido: true, dados_cadastro: codigoSalvo.dados_cadastro };
}

export function limparCodigoVerificacao(email: string, tipo: 'email' | 'telefone'): void {
  codigosVerificacao = codigosVerificacao.filter(c => !(c.email === email && c.tipo === tipo));
}

// Corretores
export function criarCorretor(data: Omit<Corretor, 'id' | 'id_corretor' | 'saldo_disponivel' | 'saldo_pendente' | 'email_verificado' | 'telefone_verificado'>): Corretor {
  const corretor: Corretor = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    id_corretor: gerarIdCorretor(),
    saldo_disponivel: 0,
    saldo_pendente: 0,
    email_verificado: true,
    telefone_verificado: true,
    created_at: new Date().toISOString(),
  };
  corretores.push(corretor);
  return corretor;
}

export function buscarCorretorPorEmail(email: string): Corretor | undefined {
  return corretores.find(c => c.email === email);
}

export function buscarCorretorPorId(id: string): Corretor | undefined {
  return corretores.find(c => c.id === id);
}

export function atualizarCorretor(id: string, data: Partial<Corretor>): Corretor | undefined {
  const index = corretores.findIndex(c => c.id === id);
  if (index !== -1) {
    corretores[index] = { ...corretores[index], ...data };
    return corretores[index];
  }
  return undefined;
}

export function validarSenha(email: string, senha: string): Corretor | undefined {
  return corretores.find(c => c.email === email && c.senha === senha);
}

// Imóveis
export function criarImovel(data: Omit<Imovel, 'id'>): Imovel {
  const imovel: Imovel = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
  };
  imoveis.push(imovel);
  return imovel;
}

export function buscarImoveisPorCorretor(corretor_id: string): Imovel[] {
  return imoveis.filter(i => i.corretor_id === corretor_id);
}

// Comissões
export function criarComissao(data: Omit<Comissao, 'id'>): Comissao {
  const comissao: Comissao = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
  };
  comissoes.push(comissao);
  
  // Atualizar saldo do corretor
  const corretor = buscarCorretorPorId(data.corretor_id);
  if (corretor) {
    if (data.status === 'disponivel') {
      corretor.saldo_disponivel += data.valor_comissao;
    } else {
      corretor.saldo_pendente += data.valor_comissao;
    }
  }
  
  return comissao;
}

export function buscarComissoesPorCorretor(corretor_id: string): Comissao[] {
  return comissoes.filter(c => c.corretor_id === corretor_id);
}

// Saques
export function criarSaque(data: Omit<Saque, 'id' | 'status'>): Saque {
  const saque: Saque = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    status: 'pendente',
    created_at: new Date().toISOString(),
  };
  saques.push(saque);
  
  // Deduzir do saldo disponível
  const corretor = buscarCorretorPorId(data.corretor_id);
  if (corretor) {
    corretor.saldo_disponivel -= data.valor;
  }
  
  return saque;
}

export function buscarSaquesPorCorretor(corretor_id: string): Saque[] {
  return saques.filter(s => s.corretor_id === corretor_id);
}

export function listarTodosCorretores(): Corretor[] {
  return corretores;
}

export function listarTodosSaques(): Saque[] {
  return saques;
}

export function atualizarStatusSaque(id: string, status: Saque['status']): Saque | undefined {
  const index = saques.findIndex(s => s.id === id);
  if (index !== -1) {
    saques[index].status = status;
    return saques[index];
  }
  return undefined;
}
