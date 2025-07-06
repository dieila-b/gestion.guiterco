
export interface CartItem {
  article_id: string;
  nom: string;
  reference: string;
  prix_unitaire: number;
  prix_unitaire_brut?: number; // Ajouter prix_unitaire_brut
  quantite: number;
  remise?: number;
  remise_unitaire?: number; // Ajouter remise_unitaire
  prix_final: number;
  stock_disponible?: number;
  // Mandatory id for compatibility
  id: string;
  prix_vente?: number;
}

export interface VenteComptoirData {
  client_id: string;
  cart: CartItem[];
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  mode_paiement?: string;
  point_vente_id?: string;
  payment_data?: any; // Ajouter cette propriété
}

export interface Client {
  id: string;
  nom: string;
  nom_entreprise?: string;
  email?: string;
  telephone?: string;
  type_client?: string;
}
