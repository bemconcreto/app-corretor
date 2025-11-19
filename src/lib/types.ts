// Tipos do sistema Bem Concreto

export interface Corretor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  rede_social: string;
  creci?: string; // Opcional
  senha: string;
  id_corretor: string;
  saldo_disponivel: number;
  saldo_pendente: number;
  email_verificado: boolean;
  telefone_verificado: boolean;
  dados_bancarios?: DadosBancarios;
  google_id?: string; // Nova propriedade para login com Google
  needs_completion?: boolean; // Flag para indicar se precisa completar cadastro
  created_at?: string;
}

export interface DadosBancarios {
  nome_completo: string;
  cpf: string;
  banco: string;
  codigo_banco: string;
  agencia: string;
  conta: string;
  chave_pix: string;
}

export interface Imovel {
  id: string;
  corretor_id: string;
  nome: string;
  cidade: string;
  estado: string;
  preco: number;
  descricao: string;
  fotos: string[];
  created_at?: string;
}

export interface Comissao {
  id: string;
  corretor_id: string;
  venda_valor: number;
  porcentagem: number;
  valor_comissao: number;
  status: 'pendente' | 'disponivel';
  created_at?: string;
}

export interface Saque {
  id: string;
  corretor_id: string;
  valor: number;
  pix: string;
  status: 'pendente' | 'aprovado' | 'pago';
  created_at?: string;
}

export interface CodigoVerificacao {
  email: string;
  codigo: string;
  tipo: 'email' | 'telefone';
  expira_em: string;
  dados_cadastro?: any;
}
