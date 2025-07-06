export interface Client {
  id: string;
  nom: string;
  nom_entreprise?: string;
  email?: string;
  telephone?: string;
  whatsapp?: string;
  adresse?: string;
  ville?: string;
  statut_client?: string;
  type_client?: string;
  limite_credit?: number;
  created_at: string;
  updated_at: string;
}

export interface CommandeClient {
  id: string;
  numero_commande: string;
  client_id?: string;
  date_commande: string;
  statut: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  taux_tva?: number;
  mode_paiement?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface LigneCommande {
  id: string;
  commande_id?: string;
  article_id?: string;
  quantite: number;
  prix_unitaire: number;
  montant_ligne: number;
  created_at: string;
}

export interface LigneFactureVente {
  id: string;
  facture_vente_id?: string;
  article_id?: string;
  quantite: number;
  quantite_livree?: number;
  prix_unitaire: number;
  prix_unitaire_brut?: number;
  remise_unitaire?: number;
  montant_ligne: number;
  statut_livraison?: string;
  created_at: string;
  article?: {
    id: string;
    nom: string;
    reference: string;
  };
}

export interface FactureVente {
  id: string;
  numero_facture: string;
  commande_id?: string;
  client_id: string;
  date_facture: string;
  date_echeance?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  remise_totale?: number;
  taux_tva?: number;
  statut_paiement: string;
  mode_paiement?: string;
  date_paiement?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  commande?: CommandeClient;
  lignes_facture?: LigneFactureVente[];
  versements?: VersementClient[];
  nb_articles?: number;
  statut_livraison?: string;
}

export interface Precommande {
  id: string;
  numero_precommande: string;
  client_id: string;
  date_precommande: string;
  date_livraison_prevue?: string;
  statut: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  taux_tva?: number;
  acompte_verse?: number;
  observations?: string;
  notification_envoyee?: boolean;
  date_notification?: string;
  bon_livraison_genere?: boolean;
  bon_livraison_id?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface LignePrecommande {
  id: string;
  precommande_id?: string;
  article_id?: string;
  quantite: number;
  prix_unitaire: number;
  montant_ligne: number;
  created_at: string;
}

export interface FacturePrecommande {
  id: string;
  numero_facture: string;
  precommande_id: string;
  client_id: string;
  date_facture: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  type_facture: string;
  statut_paiement: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  precommande?: Precommande;
}

export interface VersementClient {
  id: string;
  numero_versement: string;
  client_id: string;
  facture_id?: string;
  date_versement: string;
  montant: number;
  mode_paiement: string;
  reference_paiement?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface DevisVente {
  id: string;
  numero_devis: string;
  client_id: string;
  date_devis: string;
  date_validite?: string;
  statut: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  taux_tva?: number;
  observations?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface LigneDevis {
  id: string;
  devis_id?: string;
  article_id?: string;
  quantite: number;
  prix_unitaire: number;
  montant_ligne: number;
  created_at: string;
}

export interface RetourClient {
  id: string;
  numero_retour: string;
  client_id: string;
  facture_id?: string;
  date_retour: string;
  motif_retour: string;
  statut: string;
  montant_retour: number;
  date_remboursement?: string;
  mode_remboursement?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  facture?: FactureVente;
}

export interface ArticleRetourClient {
  id: string;
  retour_id?: string;
  article_id?: string;
  quantite: number;
  prix_unitaire: number;
  montant_ligne: number;
  etat_article?: string;
  created_at: string;
}
