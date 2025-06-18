
export interface StatsGlobales {
  totalClients: number;
  totalDette: number;
  totalFactures: number;
  montantTotal: number;
}

export interface ClientGroupe {
  client: {
    id: string;
    nom: string;
    email: string;
    telephone: string;
  };
  factures: Array<{
    id: string;
    numero_facture: string;
    date_facture: string;
    montant_total: number;
    montant_paye: number;
    reste_a_payer: number;
    statut_paiement: string;
  }>;
  totalDette: number;
  totalFacture: number;
  totalPaye: number;
}
