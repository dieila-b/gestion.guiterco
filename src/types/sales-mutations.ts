
export type CreateCommandeInput = {
  numero_commande: string;
  client_id?: string;
  montant_ht?: number;
  tva?: number;
  montant_ttc?: number;
  statut?: string;
  mode_paiement?: string;
  observations?: string;
};

export interface CreateFactureInput {
  client_id: string;
  montant_ht: number;
  montant_ttc: number;
  tva: number;
  mode_paiement?: string;
  statut_livraison?: 'En attente' | 'Partiellement livrée' | 'Livrée';
  statut_livraison_id: number;
  numero_facture?: string; // Optional since it's auto-generated
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
}
