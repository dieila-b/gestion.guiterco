
// Types pour les entités de stock
export type Entrepot = {
  id: string;
  nom: string;
  adresse: string | null;
  capacite_max: number | null;
  gestionnaire: string | null;
  statut: string | null;
  created_at: string;
  updated_at: string;
};

export type PointDeVente = {
  id: string;
  nom: string;
  adresse: string | null;
  type_pdv: string | null;
  responsable: string | null;
  statut: string | null;
  created_at: string;
  updated_at: string;
};

export type Article = {
  id: string;
  reference: string;
  nom: string;
  description: string | null;
  categorie: string | null;
  unite_mesure: string | null;
  prix_unitaire: number | null;
  prix_achat: number | null;
  prix_vente: number | null;
  seuil_alerte: number | null;
  statut: string | null;
  created_at?: string; // Optionnel car peut ne pas être inclus dans certaines requêtes
  updated_at?: string; // Optionnel car peut ne pas être inclus dans certaines requêtes
  categorie_article?: { nom: string };
  unite_article?: { nom: string };
};

export type StockPrincipal = {
  id: string;
  article_id: string | null;
  entrepot_id: string | null;
  quantite_disponible: number;
  quantite_reservee: number;
  emplacement: string | null;
  derniere_entree: string | null;
  derniere_sortie: string | null;
  created_at: string;
  updated_at: string;
  article?: Article;
  entrepot?: Entrepot;
};

export type StockPointDeVente = {
  id: string;
  article_id: string | null;
  point_vente_id: string | null;
  quantite_disponible: number;
  quantite_minimum: number | null;
  derniere_livraison: string | null;
  created_at: string;
  updated_at: string;
  article?: Article;
  point_vente?: PointDeVente;
};

export type EntreeStock = {
  id: string;
  article_id: string | null;
  entrepot_id: string | null;
  point_vente_id: string | null;
  quantite: number;
  type_entree: string;
  numero_bon: string | null;
  fournisseur: string | null;
  prix_unitaire: number | null;
  observations: string | null;
  created_at: string;
  created_by: string | null;
  article?: Article;
  entrepot?: Entrepot;
  point_vente?: PointDeVente;
};

export type SortieStock = {
  id: string;
  article_id: string | null;
  entrepot_id: string | null;
  quantite: number;
  type_sortie: string;
  destination: string | null;
  numero_bon: string | null;
  observations: string | null;
  created_at: string;
  created_by: string | null;
  article?: Article;
  entrepot?: Entrepot;
};

export type Transfert = {
  id: string;
  reference: string | null;
  article_id: string | null;
  entrepot_source_id: string | null;
  entrepot_destination_id: string | null;
  pdv_destination_id: string | null;
  quantite: number;
  statut: string | null;
  numero_transfert: string | null;
  date_expedition: string | null;
  date_reception: string | null;
  observations: string | null;
  created_at: string;
  created_by: string | null;
  article?: Article;
  entrepot_source?: Entrepot;
  entrepot_destination?: Entrepot;
  pdv_destination?: PointDeVente;
};
