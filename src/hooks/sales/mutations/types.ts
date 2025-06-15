
export interface CreateVersementInput {
  facture_id: string;
  client_id: string;
  montant: number;
  mode_paiement: string;
  reference_paiement?: string;
  observations?: string;
}

export interface UpdateFactureStatutInput {
  factureId: string;
  statut_livraison?: string;
  statut_paiement?: string;
}
