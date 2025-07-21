
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Key, Eye, Edit, Trash2, Settings } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissionsSystem';

// Structure complète des menus et sous-menus de l'application
const APPLICATION_STRUCTURE = [
  {
    menu: 'Dashboard',
    submenu: null,
    actions: ['read'],
    description: 'Tableau de bord principal'
  },
  {
    menu: 'Ventes',
    submenu: 'Vente au Comptoir',
    actions: ['read', 'write'],
    description: 'Gestion des ventes au comptoir'
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
    menu: 'Clients',
    submenu: null,
    actions: ['read', 'write', 'delete'],
    description: 'Gestion des clients'
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
    submenu: 'Zone Géographique',
    actions: ['read', 'write'],
    description: 'Gestion des zones géographiques'
  },
  {
    menu: 'Paramètres',
    submenu: 'Fournisseurs',
    actions: ['read', 'write'],
    description: 'Gestion des fournisseurs'
  },
  {
    menu: 'Paramètres',
    submenu: 'Dépôts Stock',
    actions: ['read', 'write'],
    description: 'Gestion des dépôts de stock'
  },
  {
    menu: 'Paramètres',
    submenu: 'Dépôts PDV',
    actions: ['read', 'write'],
    description: 'Gestion des dépôts PDV'
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
  }
];

export default function PermissionsConfig() {
  const { data: permissions = [], isLoading } = usePermissions();

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

  const getActionColor = (action: string) => {
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

  // Grouper les permissions par menu
  const groupedMenus = APPLICATION_STRUCTURE.reduce((acc, item) => {
    const menuKey = item.menu;
    if (!acc[menuKey]) {
      acc[menuKey] = [];
    }
    
    item.actions.forEach(action => {
      acc[menuKey].push({
        ...item,
        action: action,
        id: `${item.menu}-${item.submenu}-${action}`
      });
    });
    
    return acc;
  }, {} as Record<string, Array<any>>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configuration des Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Activez ou désactivez les permissions pour chaque menu et sous-menu
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedMenus).map(([menuName, menuPermissions]) => (
          <Card key={menuName}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
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
                    key={`${permission.id}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {permission.submenu ? `${permission.submenu} →` : ''} {getActionLabel(permission.action)}
                        </span>
                        <Badge variant="outline" className={`${getActionColor(permission.action)} text-xs`}>
                          {getActionIcon(permission.action)}
                          <span className="ml-1">{getActionLabel(permission.action)}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {permission.description}
                      </p>
                    </div>
                    <Switch
                      defaultChecked={true}
                      onCheckedChange={(checked) => {
                        // Les permissions sont activées par défaut
                        console.log(`Permission ${permission.id}: ${checked}`);
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
