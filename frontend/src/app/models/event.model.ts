export type StatutInscription = 'INSCRIT' | 'EN_ATTENTE' | 'DESINSCRIT';

export interface EventItem {
  id: number;
  titre: string;
  description: string;
  categorieId: number;
  categorieLibelle: string;
  statut: string;
  auteurId: number;
  auteurNom: string;
  dateEvenement: string;
  lieu: string | null;
  adresse: string | null;
  createdAt: string;
  capaciteMax: number | null;
  nombreInscrits: number;
  placesRestantes: number | null;
  complet: boolean;
  tauxRemplissage: number | null;
}

export interface InscriptionStatus {
  statut: StatutInscription | null;
  rang: number | null;
}

export interface ParticipantItem {
  nom: string;
  prenom: string;
}

export interface ParticipantsResponse {
  participants: ParticipantItem[];
  nombreEnAttente: number;
}

export interface EventFilterParams {
  motCle?: string;
  lieu?: string;
  aVenir?: boolean;
}
