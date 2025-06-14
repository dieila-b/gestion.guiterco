export interface BonCommande {
  id: string;
  numero_bon: string;
  fournisseur: string;
  fournisseur_id?: string;
  date_commande: string;
  date_livraison_prevue?: string;
  statut: string;
  statut_paiement?: string;
  montant_total: number;
  tva?: number;
  montant_ht: number;
  remise?: number;
  frais_livraison?: number;
  frais_logistique?: number;
  transit_douane?: number;
  taux_tva?: number;
  montant_paye?: number;
  observations?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface BonLivraison {
  id: string;
  numero_bon: string;
  bon_commande_id?: string;
  fournisseur: string;
  date_livraison: string;
  date_reception?: string;
  statut: string;
  transporteur?: string;
  numero_suivi?: string;
  transit_douane?: number;
  taux_tva?: number;
  observations?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  entrepot_destination_id?: string;
  point_vente_destination_id?: string;
  bon_commande?: BonCommande;
  entrepot_destination?: {
    id: string;
    nom: string;
  };
  point_vente_destination?: {
    id: string;
    nom: string;
  };
}

export interface FactureAchat {
  id: string;
  numero_facture: string;
  bon_commande_id?: string;
  bon_livraison_id?: string;
  fournisseur: string;
  date_facture: string;
  date_echeance?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  transit_douane?: number;
  taux_tva?: number;
  statut_paiement: string;
  mode_paiement?: string;
  date_paiement?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  bon_commande?: BonCommande;
  bon_livraison?: BonLivraison;
}

export interface RetourFournisseur {
  id: string;
  numero_retour: string;
  facture_achat_id?: string;
  fournisseur: string;
  date_retour: string;
  motif_retour: string;
  statut: string;
  montant_retour: number;
  date_remboursement?: string;
  mode_remboursement?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  facture_achat?: FactureAchat;
}
