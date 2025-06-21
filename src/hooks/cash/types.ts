
export interface ClôtureCaisse {
  id: string;
  cash_register_id: string;
  date_cloture: string;
  heure_cloture: string;
  solde_debut: number;
  solde_fin: number;
  total_entrees: number;
  total_sorties: number;
  balance_jour: number;
  nb_transactions: number;
  utilisateur_cloture?: string;
  observations?: string;
}

export interface ComptageDetails {
  [key: string]: number; // Index signature pour compatibilité Json
  billet_500: number;
  billet_200: number;
  billet_100: number;
  billet_50: number;
  billet_20: number;
  billet_10: number;
  billet_5: number;
  piece_2: number;
  piece_1: number;
  piece_050: number;
  piece_020: number;
  piece_010: number;
  piece_005: number;
  piece_002: number;
  piece_001: number;
}

export interface ComptageRequest {
  cash_register_id: string;
  montant_theorique: number;
  montant_reel: number;
  details_coupures?: ComptageDetails;
  observations?: string;
}
