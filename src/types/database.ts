
// Types centralisés pour la base de données
export interface DatabaseTables {
  // Catalogue et produits
  catalogue: {
    id: string;
    nom: string;
    reference: string;
    description?: string;
    prix_achat?: number;
    prix_vente?: number;
    prix_unitaire?: number;
    unite_mesure?: string;
    categorie?: string;
    categorie_id?: string;
    unite_id?: string;
    seuil_alerte?: number;
    statut?: string;
    image_url?: string;
    frais_logistique?: number;
    frais_douane?: number;
    frais_transport?: number;
    autres_frais?: number;
    frais_bon_commande?: number;
    created_at: string;
    updated_at: string;
  };

  // Clients
  clients: {
    id: string;
    nom: string;
    prenom?: string;
    nom_entreprise?: string;
    email?: string;
    telephone?: string;
    whatsapp?: string;
    adresse?: string;
    ville?: string;
    code_postal?: string;
    pays?: string;
    type_client?: string;
    statut_client?: string;
    limite_credit?: number;
    created_at: string;
    updated_at: string;
  };

  // Factures de vente
  factures_vente: {
    id: string;
    numero_facture: string;
    client_id: string;
    date_facture: string;
    date_echeance?: string;
    montant_ht: number;
    tva: number;
    montant_ttc: number;
    taux_tva?: number;
    remise_totale?: number;
    statut_paiement: string;
    statut_livraison?: string;
    statut_livraison_id: number;
    mode_paiement?: string;
    date_paiement?: string;
    observations?: string;
    commande_id?: string;
    created_at: string;
    updated_at: string;
  };

  // Lignes de facture de vente
  lignes_facture_vente: {
    id: string;
    facture_vente_id: string;
    article_id: string;
    quantite: number;
    prix_unitaire_brut: number;
    remise_unitaire?: number;
    montant_ligne?: number;
    quantite_livree?: number;
    statut_livraison?: string;
    created_at?: string;
  };

  // Statuts de livraison
  livraison_statut: {
    id: number;
    nom: string;
  };

  // Entrepôts
  entrepots: {
    id: string;
    nom: string;
    adresse?: string;
    gestionnaire?: string;
    capacite_max?: number;
    statut?: string;
    created_at: string;
    updated_at: string;
  };

  // Stock principal
  stock_principal: {
    id: string;
    article_id: string;
    entrepot_id: string;
    quantite_disponible: number;
    seuil_alerte?: number;
    derniere_entree?: string;
    created_at: string;
    updated_at: string;
  };

  // Utilisateurs internes
  utilisateurs_internes: {
    id: string;
    user_id?: string;
    email: string;
    prenom: string;
    nom: string;
    matricule?: string;
    role_id?: string;
    statut: 'actif' | 'inactif' | 'suspendu';
    type_compte: 'employe' | 'gestionnaire' | 'admin';
    photo_url?: string;
    telephone?: string;
    date_embauche?: string;
    department?: string;
    created_at: string;
    updated_at: string;
  };

  // Rôles
  roles: {
    id: string;
    name: string;
    description?: string;
    is_system?: boolean;
    created_at?: string;
  };

  // Permissions
  permissions: {
    id: string;
    menu_id?: string;
    sous_menu_id?: string;
    menu: string;
    submenu?: string;
    action: string;
    description?: string;
    created_at: string;
  };

  // Permissions de rôles
  role_permissions: {
    id: string;
    role_id: string;
    permission_id: string;
    can_access: boolean;
  };

  // Menus
  menus: {
    id: string;
    nom: string;
    icone?: string;
    ordre?: number;
    statut?: string;
    created_at?: string;
    updated_at?: string;
  };

  // Paiements de vente
  paiements_vente: {
    id: string;
    facture_vente_id: string;
    montant: number;
    moyen_paiement?: string;
    date_paiement?: string;
    created_at?: string;
  };

  // Demandes de réinitialisation de mot de passe
  password_reset_requests: {
    id: string;
    user_id: string;
    new_password_hash: string;
    require_change?: boolean;
    used?: boolean;
    expires_at?: string;
    created_at?: string;
  };
}

// Types pour les relations
export type TableName = keyof DatabaseTables;
