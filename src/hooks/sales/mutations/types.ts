
export interface CreateVersementInput {
  facture_id: string;
  client_id: string;
  montant: number;
  mode_paiement: string;
  reference_paiement?: string;
  observations?: string;
}

export interface UpdateFactureStatutInput {
  factureId: string;
  statut_livraison?: string;
  statut_paiement?: string;
}

export interface CreateFactureVenteData {
  client_id: string;
  cart: CartItem[];
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  mode_paiement?: string;
  point_vente_id?: string;
  payment_data?: {
    montant_paye: number;
    statut_livraison: string;
    notes?: string;
  };
}

export interface CartItem {
  article_id: string;
  quantite: number;
  prix_unitaire: number;
  prix_unitaire_brut?: number; // Ajouter prix_unitaire_brut
  remise?: number; // Ajout de la remise optionnelle
  remise_unitaire?: number; // Ajouter remise_unitaire
}
