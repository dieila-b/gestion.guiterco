
export interface Pays {
  id: string;
  nom: string;
  code_iso: string;
  created_at: string;
}

export interface Ville {
  id: string;
  nom: string;
  pays_id: string;
  code_postal?: string;
  created_at: string;
  pays?: Pays;
}

export interface Fournisseur {
  id: string;
  nom?: string; // Ancien champ, maintenant optionnel
  nom_entreprise?: string;
  contact_principal?: string;
  email?: string;
  telephone?: string; // Ancien champ
  telephone_mobile?: string;
  telephone_fixe?: string;
  adresse?: string; // Ancien champ
  adresse_complete?: string;
  boite_postale?: string;
  site_web?: string;
  pays_id?: string;
  ville_id?: string;
  ville_personnalisee?: string;
  statut?: string;
  created_at: string;
  updated_at: string;
  pays?: Pays;
  ville?: Ville;
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
