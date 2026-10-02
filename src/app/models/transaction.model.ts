export enum TypeTransaction {
  Depot = 1,
  Retrait = 2,
  Virement = 3,
}

export interface Transaction {
  id: number;
  reference: string;
  type: TypeTransaction;
  montant: number;
  dateOperation: string;
  description: string | null;
  compteSourceId: number;
  compteDestinationId: number | null;
  agentId: string;
}

export interface Depot {
  compteId: number;
  montant: number;
  description: string | null;
}

export interface Retrait {
  compteId: number;
  montant: number;
  description: string | null;
}

export interface Virement {
  compteSourceId: number;
  compteDestinationId: number;
  montant: number;
  description: string | null;
}
