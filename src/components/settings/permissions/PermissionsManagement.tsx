
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

// Utiliser exactement la même structure que dans PermissionsMatrix
const APPLICATION_MENUS = [
  {
    menu: 'Dashboard',
    submenu: null,
    actions: ['read'],
    description: 'Tableau de bord principal'
  },
  {
    menu: 'Catalogue',
    submenu: null,
    actions: ['read', 'write', 'delete'],
    description: 'Gestion du catalogue produits'
  },
  {
    menu: 'Stock',
    submenu: 'Entrepôts',
    actions: ['read', 'write'],
    description: 'Gestion des stocks entrepôts'
  },
  {
    menu: 'Stock',
    submenu: 'PDV',
    actions: ['read', 'write'],
    description: 'Gestion des stocks points de vente'
  },
  {
    menu: 'Stock',
    submenu: 'Transferts',
    actions: ['read', 'write'],
    description: 'Gestion des transferts de stock'
  },
  {
    menu: 'Stock',
    submenu: 'Entrées',
    actions: ['read', 'write'],
    description: 'Gestion des entrées de stock'
  },
  {
    menu: 'Stock',
    submenu: 'Sorties',
    actions: ['read', 'write'],
    description: 'Gestion des sorties de stock'
  },
  {
    menu: 'Achats',
    submenu: 'Bons de commande',
    actions: ['read', 'write'],
    description: 'Gestion des bons de commande'
  },
  {
    menu: 'Achats',
    submenu: 'Bons de livraison',
    actions: ['read', 'write'],
    description: 'Gestion des bons de livraison'
  },
  {
    menu: 'Achats',
    submenu: 'Factures',
    actions: ['read', 'write'],
    description: 'Gestion des factures d\'achat'
  },
  {
    menu: 'Ventes',
    submenu: 'Factures',
    actions: ['read', 'write'],
    description: 'Gestion des factures de vente'
  },
  {
    menu: 'Ventes',
    submenu: 'Précommandes',
    actions: ['read', 'write'],
    description: 'Gestion des précommandes'
  },
  {
    menu: 'Ventes',
    submenu: 'Devis',
    actions: ['read', 'write'],
    description: 'Gestion des devis'
  },
  {
    menu: 'Ventes',
    submenu: 'Vente au Comptoir',
    actions: ['read', 'write'],
    description: 'Gestion des ventes au comptoir'
  },
  {
    menu: 'Ventes',
    submenu: 'Factures impayées',
    actions: ['read', 'write'],
    description: 'Gestion des factures impayées'
  },
  {
    menu: 'Ventes',
    submenu: 'Retours Clients',
    actions: ['read', 'write'],
    description: 'Gestion des retours clients'
  },
  {
    menu: 'Clients',
    submenu: null,
    actions: ['read', 'write'],
    description: 'Gestion des clients'
  },
  {
    menu: 'Clients',
    submenu: 'Clients',
    actions: ['read', 'write'],
    description: 'Gestion détaillée des clients'
  },
  {
    menu: 'Caisse',
    submenu: null,
    actions: ['read', 'write'],
    description: 'Gestion de la caisse'
  },
  {
    menu: 'Caisse',
    submenu: 'Dépenses',
    actions: ['read', 'write'],
    description: 'Gestion des dépenses de caisse'
  },
  {
    menu: 'Caisse',
    submenu: 'Aperçu du jour',
    actions: ['read'],
    description: 'Consultation de l\'aperçu journalier'
  },
  {
    menu: 'Marges',
    submenu: null,
    actions: ['read'],
    description: 'Consultation des marges'
  },
  {
    menu: 'Rapports',
    submenu: null,
    actions: ['read', 'write'],
    description: 'Génération de rapports'
  },
  {
    menu: 'Paramètres',
    submenu: null,
    actions: ['read', 'write'],
    description: 'Accès aux paramètres généraux'
  },
  {
    menu: 'Paramètres',
    submenu: 'Utilisateurs',
    actions: ['read', 'write'],
    description: 'Gestion des utilisateurs'
  },
  {
    menu: 'Paramètres',
    submenu: 'Permissions',
    actions: ['read', 'write'],
    description: 'Gestion des permissions'
  },
  {
    menu: 'Paramètres',
    submenu: 'Fournisseurs',
    actions: ['read', 'write'],
    description: 'Gestion des fournisseurs'
  }
];

const PermissionsManagement = () => {
  const { data: permissions, isLoading, error } = usePermissions();

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'read':
        return 'secondary';
      case 'write':
        return 'default';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return <Eye className="h-3 w-3" />;
      case 'write':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      default:
        return <Key className="h-3 w-3" />;
    }
  };

  const getActionLabel = (action: string) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground mb-4">
            Impossible de charger les permissions : {error.message}
          </p>
        </div>
      </div>
    );
  }

  // Grouper les permissions par menu (utiliser APPLICATION_MENUS comme référence)
  const groupedMenus = APPLICATION_MENUS.reduce((acc, menuItem) => {
    const menuKey = menuItem.menu;
    if (!acc[menuKey]) {
      acc[menuKey] = [];
    }
    
    // Ajouter chaque action pour ce menu/sous-menu
    menuItem.actions.forEach(action => {
      acc[menuKey].push({
        menu: menuItem.menu,
        submenu: menuItem.submenu,
        action: action,
        description: menuItem.description,
        id: `${menuItem.menu}-${menuItem.submenu}-${action}` // ID fictif pour l'affichage
      });
    });
    
    return acc;
  }, {} as Record<string, Array<{menu: string, submenu: string | null, action: string, description: string, id: string}>>);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Gestion des Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Liste détaillée des permissions par menu et sous-menu (synchronisée avec la Matrice)
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedMenus).map(([menuName, menuPermissions]) => (
          <Card key={menuName}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <CardTitle className="text-base">{menuName}</CardTitle>
                <Badge variant="outline">
                  {menuPermissions.length} permission{menuPermissions.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {menuPermissions.map((permission, index) => (
                  <div
                    key={`${permission.menu}-${permission.submenu}-${permission.action}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {permission.submenu ? `${permission.submenu} →` : ''} {getActionLabel(permission.action)}
                        </span>
                        <Badge variant={getActionBadgeVariant(permission.action)}>
                          {getActionIcon(permission.action)}
                          <span className="ml-1 capitalize">{getActionLabel(permission.action)}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(groupedMenus).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune permission trouvée</h3>
            <p className="text-muted-foreground">
              Les permissions sont gérées automatiquement par le système
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PermissionsManagement;
