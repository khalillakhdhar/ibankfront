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

export interface LoginApiResponse {
  session?: AuthResponse | null;
  requiresTwoFactor: boolean;
  twoFactorChallenge?: string | null;
}

export interface AuthenticatedLogin {
  status: 'authenticated';
  session: AuthResponse;
}

export interface TwoFactorRequired {
  status: 'twoFactorRequired';
}

export type LoginResult = AuthenticatedLogin | TwoFactorRequired;

export interface TwoFactorStatus {
  enabled: boolean;
  recoveryCodesLeft: number;
}

export interface TwoFactorSetup {
  sharedKey: string;
  authenticatorUri: string;
}

export interface TwoFactorRecoveryCodes {
  recoveryCodes: string[];
}
