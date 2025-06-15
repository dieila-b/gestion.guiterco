
export interface CartItem {
  id: string;
  nom: string;
  prix_vente: number;
  quantite: number;
  remise: number; // Remise en montant fixe
  stock_disponible?: number;
}

export interface VenteComptoirData {
  client_id: string;
  point_vente: string;
  articles: CartItem[];
  montant_total: number;
  montant_paye: number;
  mode_paiement: string;
  statut_livraison: string;
  quantite_livree?: { [key: string]: number };
  notes?: string;
}
