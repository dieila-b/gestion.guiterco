
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
