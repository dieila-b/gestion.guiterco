
export interface ArticleWithMargin {
  id: string;
  nom: string;
  reference: string;
  prix_achat?: number;
  prix_vente?: number;
  frais_logistique?: number;
  frais_douane?: number;
  frais_transport?: number;
  autres_frais?: number;
  frais_bon_commande?: number; // Ajout du champ pour les frais BC
  cout_total_unitaire: number;
  marge_unitaire: number;
  taux_marge: number;
  created_at: string;
  updated_at: string;
}

export interface FactureWithMargin {
  facture_id: string;
  numero_facture: string;
  date_facture: string;
  client_nom: string;
  montant_ttc: number;
  cout_total: number;
  benefice_total: number;
  taux_marge_global: number;
}

export interface RapportMargePeriode {
  total_ventes: number;
  total_couts: number;
  benefice_total: number;
  taux_marge_moyen: number;
  nombre_factures: number;
}

export interface MargeGlobaleStock {
  id: string;
  nom: string;
  reference: string;
  stock_total: number;
  prix_achat?: number;
  prix_vente?: number;
  cout_total_unitaire: number;
  marge_unitaire: number;
  taux_marge: number;
  marge_totale_article: number;
  valeur_stock_cout: number;
  valeur_stock_vente: number;
}

export interface ResumeMargesGlobalesStock {
  total_articles_en_stock: number;
  valeur_totale_stock_cout: number;
  valeur_totale_stock_vente: number;
  marge_totale_globale: number;
  taux_marge_moyen_pondere: number;
}
