

export interface CartItem {
  id: string;
  article_id?: string;
  nom: string;
  prix_unitaire: number;
  prix_unitaire_brut?: number;
  prix_vente?: number;
  quantite: number;
  remise?: number;
  remise_unitaire?: number;
  stock_disponible?: number;
  reference?: string;
  unite_mesure?: string;
  categorie?: string;
  seuil_alerte?: number;
  prix_final?: number;
}

export interface VenteComptoirData {
  client_id: string;
  cart: CartItem[];
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  mode_paiement: string;
  point_vente_id: string;
  payment_data?: {
    montant_paye: number;
    mode_paiement: string;
    statut_livraison: string;
    statut_paiement: string;
    quantite_livree: Record<string, number>;
    notes?: string;
  };
}

