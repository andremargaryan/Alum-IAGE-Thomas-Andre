export type Role = 'ETUDIANT' | 'ORGANISATEUR' | 'ADMIN';

export interface LoginRequest {
  email: string;
  motDePasse: string;
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