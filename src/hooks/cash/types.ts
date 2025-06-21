
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
  billet_20000: number;
  billet_10000: number;
  billet_5000: number;
  billet_2000: number;
  billet_1000: number;
  billet_500: number;
}

export interface ComptageRequest {
  cash_register_id: string;
  montant_theorique: number;
  montant_reel: number;
  details_coupures?: ComptageDetails;
  observations?: string;
}
