export interface Guichet {
  id: number;
  code: string;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string | null;
  isActive: boolean;
  dateCreation: string;
  nombreAgents: number;
}

export interface CreateGuichet {
  code: string;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string | null;
}

export interface UpdateGuichet {
  nom: string;
  adresse: string;
  ville: string;
  telephone: string | null;
  isActive: boolean;
}
