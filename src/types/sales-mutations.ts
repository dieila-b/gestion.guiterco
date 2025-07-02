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

export interface CreateFactureInput {
  client_id: string;
  montant_ht: number;
  montant_ttc: number;
  tva: number;
  mode_paiement?: string;
  statut_livraison_id: number;
}
