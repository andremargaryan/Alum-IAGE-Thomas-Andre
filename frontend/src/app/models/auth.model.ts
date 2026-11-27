export type Role = 'ETUDIANT' | 'ORGANISATEUR' | 'ADMIN';

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  ville: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  expireDansMinutes: number;
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  ville?: string;
}