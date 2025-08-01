export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'seller';
  createdAt: Date;
}

export interface Proposal {
  id: string;
  sellerId: string;
  provider: string;
  whatsapp?: string;
  email?: string;
  responsibleName?: string;
  status: 'Inicio' | 'Negociando' | 'Quase fechando' | 'Concluído com sucesso' | 'Encerrado por falta de interesse';
  descriptions: ProposalDescription[];
  plan?: string;
  value?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProposalDescription {
  id: string;
  text: string;
  createdAt: Date;
}

export interface Lead {
  id: string;
  sellerId: string;
  provider: string;
  contact?: string;
  website?: string;
  state?: string;
  createdAt: Date;
}

export interface Meeting {
  id: string;
  sellerId: string;
  proposalId: string;
  provider: string;
  date: Date;
  time: string;
  type: 'E-mail' | 'Ligação' | 'WhatsApp' | 'Vídeo Chamada';
  contact: string;
  notes?: string;
  createdAt: Date;
}
