
export interface Fournisseur {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleBonCommande {
  id: string;
  bon_commande_id: string;
  article_id: string;
  quantite: number;
  prix_unitaire: number;
  montant_ligne: number;
  created_at: string;
  article?: {
    id: string;
    nom: string;
    reference: string;
    prix_unitaire?: number;
  };
}
