
export interface CartItem {
  id: string;
  article_id: string;
  nom: string;
  reference: string;
  prix_unitaire_brut: number; // Utiliser prix_unitaire_brut
  quantite: number;
  remise_unitaire?: number;
  prix_final: number;
  stock_disponible: number;
  prix_vente?: number;
}

export interface PointDeVente {
  id: string;
  nom: string;
  statut: string;
  adresse?: string;
  created_at: string;
  updated_at: string;
}

export interface StockPDV {
  id: string;
  point_vente_id: string;
  article_id: string;
  quantite_disponible: number;
  seuil_alerte?: number;
  derniere_livraison?: string;
  created_at: string;
  updated_at: string;
  article?: {
    id: string;
    nom: string;
    reference: string;
    prix_vente: number;
    categorie?: string;
  };
  point_vente?: PointDeVente;
}

export interface TransactionResult {
  success: boolean;
  factureId?: string;
  transactionId?: string;
  error?: string;
}
