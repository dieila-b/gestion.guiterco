
export type CreateCommandeInput = {
  numero_commande: string;
  client_id?: string;
  montant_ht?: number;
  tva?: number;
  montant_ttc?: number;
  statut?: string;
  mode_paiement?: string;
  observations?: string;
};

export type CreateFactureInput = {
  numero_facture: string;
  client_id: string;
  commande_id?: string;
  montant_ht?: number;
  tva?: number;
  montant_ttc?: number;
  statut_paiement?: string;
  statut_livraison_id?: number; // Added required field
  mode_paiement?: string;
  date_echeance?: string;
  observations?: string;
};
