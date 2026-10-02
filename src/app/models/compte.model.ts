export interface CompteSummary {
  id: number;
  numeroCompte: string;
  solde: number;
  typeCompte: string;
  isActive: boolean;
}

export interface Compte {
  id: number;
  numeroCompte: string;
  solde: number;
  dateOuverture: string;
  isActive: boolean;
  clientId: number;
  clientNomComplet: string;
  typeCompteId: number;
  typeCompte: string;
  guichetId: number;
  guichet: string;
}

export interface CreateCompte {
  numeroCompte: string;
  soldeInitial: number;
  clientId: number;
  typeCompteId: number;
  guichetId: number;
}

export interface UpdateCompte {
  isActive: boolean;
}
