
export interface CreateCommandeInput {
  numero_commande: string;
  client_id: string;
  date_commande?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  statut?: string;
  mode_paiement?: string;
  observations?: string;
}

export interface CreateFactureInput {
  numero_facture: string;
  client_id: string;
  commande_id?: string;
  date_facture?: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  statut_paiement?: string;
  statut_livraison_id: number; // Ajout du champ requis
  mode_paiement?: string;
  observations?: string;
}
