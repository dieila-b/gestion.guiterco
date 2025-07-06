

export interface CartItem {
  article_id: string;
  nom: string;
  reference: string;
  prix_unitaire: number;
  quantite: number;
  remise?: number;
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

