
export interface NotificationPrecommande {
  id: string;
  precommande_id: string;
  type_notification: 'stock_disponible' | 'livraison_generee' | 'livraison_confirmee';
  message: string;
  statut: 'en_attente' | 'envoyee' | 'vue';
  date_creation: string;
  date_envoi?: string;
  created_at: string;
  updated_at: string;
}

export interface PrecommandeComplete {
  id: string;
  numero_precommande: string;
  client_id: string;
  date_precommande: string;
  date_livraison_prevue?: string;
  statut: 'confirmee' | 'en_preparation' | 'prete' | 'livree' | 'partiellement_livree' | 'annulee' | 'convertie_en_vente';
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  taux_tva?: number;
  acompte_verse?: number;
  reste_a_payer?: number;
  total_commande?: number;
  observations?: string;
  notification_envoyee?: boolean;
  date_notification?: string;
  bon_livraison_genere?: boolean;
  bon_livraison_id?: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    nom: string;
    email?: string;
    telephone?: string;
  };
  lignes_precommande?: LignePrecommandeComplete[];
  notifications?: NotificationPrecommande[];
  bon_livraison?: {
    id: string;
    numero_bon: string;
    statut: string;
  };
}

export interface LignePrecommandeComplete {
  id: string;
  precommande_id: string;
  article_id: string;
  quantite: number;
  quantite_livree?: number;
  statut_ligne?: 'en_attente' | 'partiellement_livree' | 'livree' | 'disponible';
  prix_unitaire: number;
  montant_ligne: number;
  created_at: string;
  updated_at?: string;
  article?: {
    id: string;
    nom: string;
    reference: string;
    prix_vente?: number;
  };
  stock_disponible?: {
    entrepot: number;
    pdv: number;
    total: number;
  };
}
