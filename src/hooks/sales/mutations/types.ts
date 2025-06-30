
export interface CreateFactureVenteData {
  client_id: string;
  cart: Array<{
    article_id: string;
    quantite: number;
    prix_unitaire: number;
  }>;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  mode_paiement: string;
  point_vente_id?: string;
  payment_data?: {
    montant_paye?: number;
    mode_paiement?: string;
    statut_livraison?: string;
    quantite_livree?: Record<string, number>;
    notes?: string;
  };
}

export interface CartItem {
  article_id: string;
  quantite: number;
  prix_unitaire: number;
  nom?: string;
  remise?: number;
}

export interface VenteComptoirData {
  client_id: string;
  cart: CartItem[];
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  mode_paiement: string;
  point_vente_id?: string;
  payment_data?: {
    montant_paye?: number;
    mode_paiement?: string;
    statut_livraison?: string;
    notes?: string;
  };
}
