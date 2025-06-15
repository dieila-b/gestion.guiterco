
export interface CartItem {
  article_id: string;
  nom: string;
  reference: string;
  prix_unitaire: number;
  quantite: number;
  remise?: number;
  prix_final: number;
  stock_disponible?: number;
}

export interface VenteComptoirData {
  client_id: string;
  cart: CartItem[];
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  mode_paiement?: string;
  point_vente_id?: string;
}

export interface Client {
  id: string;
  nom: string;
  nom_entreprise?: string;
  email?: string;
  telephone?: string;
  type_client?: string;
}
