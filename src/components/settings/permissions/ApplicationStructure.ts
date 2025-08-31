
// Structure complète de l'application synchronisée avec Supabase
export const APPLICATION_STRUCTURE = [
  {
    menu: 'Dashboard',
    submenus: [],
    actions: ['read'],
    icon: '📊'
  },
  {
    menu: 'Catalogue',
    submenus: [],
    actions: ['read', 'write', 'delete'],
    icon: '📦'
  },
  {
    menu: 'Stock',
    submenus: ['Entrepôts', 'PDV', 'Mouvements', 'Inventaire'],
    actions: ['read', 'write', 'delete'],
    icon: '📋'
  },
  {
    menu: 'Ventes',
    submenus: ['Factures', 'Précommandes', 'Devis'],
    actions: ['read', 'write', 'delete'],
    icon: '💰'
  },
  {
    menu: 'Achats',
    submenus: ['Bons de commande', 'Bons de livraison', 'Factures fournisseurs'],
    actions: ['read', 'write', 'delete'],
    icon: '🛒'
  },
  {
    menu: 'Clients',
    submenus: [],
    actions: ['read', 'write', 'delete'],
    icon: '👥'
  },
  {
    menu: 'Caisse',
    submenus: ['Clôtures', 'Comptages'],
    actions: ['read', 'write'],
    icon: '💳'
  },
  {
    menu: 'Rapports',
    submenus: ['Ventes', 'Achats', 'Stock', 'Clients', 'Marges', 'Financiers', 'Caisse'],
    actions: ['read'],
    icon: '📈'
  },
  {
    menu: 'Marges',
    submenus: ['Articles', 'Catégories', 'Globales', 'Factures', 'Périodes'],
    actions: ['read'],
    icon: '📊'
  },
  {
    menu: 'Paramètres',
    submenus: ['Zone Géographique', 'Fournisseurs', 'Entrepôts', 'Points de vente', 'Utilisateurs', 'Permissions'],
    actions: ['read', 'write'],
    icon: '⚙️'
  }
];

export const getActionIcon = (action: string) => {
  switch (action) {
    case 'read':
      return '👁️';
    case 'write':
      return '✏️';
    case 'delete':
      return '🗑️';
    default:
      return '🔧';
  }
};

export const getActionLabel = (action: string) => {
  switch (action) {
    case 'read':
      return 'Lecture';
    case 'write':
      return 'Écriture';
    case 'delete':
      return 'Suppression';
    default:
      return action;
  }
};

export const getActionColor = (action: string) => {
  switch (action) {
    case 'read':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'write':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'delete':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};
