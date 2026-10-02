import type { CompteSummary } from './compte.model';

export interface CreateClient {
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string | null;
  email: string | null;
  telephone: string;
  adresse: string | null;
}

export interface Client {
  id: number;
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string | null;
  email: string | null;
  telephone: string;
  adresse: string | null;
  dateCreation: string;
  isActive: boolean;
}

export interface UpdateClient {
  nom: string;
  prenom: string;
  dateNaissance: string | null;
  email: string | null;
  telephone: string;
  adresse: string | null;
  isActive: boolean;
}

export interface ClientDetails extends Client {
  comptes: CompteSummary[];
}
