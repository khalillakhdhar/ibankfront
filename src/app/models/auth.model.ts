export interface Login {
  email: string;
  password: string;
}

export interface CreateAgent {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  guichetId: number | null;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  guichetId: number | null;
  isActive: boolean;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  expiration: string;
  user: User;
}
