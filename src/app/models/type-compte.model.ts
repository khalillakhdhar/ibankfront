export interface TypeCompte {
  id: number;
  code: string;
  libelle: string;
  description: string | null;
  soldeMinimum: number;
  fraisMensuels: number;
  isActive: boolean;
}

export interface CreateTypeCompte {
  code: string;
  libelle: string;
  description: string | null;
  soldeMinimum: number;
  fraisMensuels: number;
}

export interface UpdateTypeCompte {
  libelle: string;
  description: string | null;
  soldeMinimum: number;
  fraisMensuels: number;
  isActive: boolean;
}
