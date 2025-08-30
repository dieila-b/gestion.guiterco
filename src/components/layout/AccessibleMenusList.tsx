
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  BarChart3,
  Settings,
  Warehouse,
  Store
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AccessibleMenusList: React.FC = () => {
  const { hasPermission } = useHasPermission();
  const { utilisateurInterne } = useAuth();

  const menuItems = [
    {
      title: 'Catalogue',
      icon: Package,
      route: '/catalog',
      menu: 'Catalogue',
      description: 'Gestion du catalogue produits'
    },
    {
      title: 'Stock',
      icon: Warehouse,
      route: '/stocks',
      menu: 'Stock',
      description: 'Gestion des stocks'
    },
    {
      title: 'Ventes',
      icon: ShoppingCart,
      route: '/sales',
      menu: 'Ventes',
      description: 'Gestion des ventes'
    },
    {
      title: 'Achats',
      icon: Store,
      route: '/purchases',
      menu: 'Achats',
      description: 'Gestion des achats'
    },
    {
      title: 'Clients',
      icon: Users,
      route: '/clients',
      menu: 'Clients',
      description: 'Gestion des clients'
    },
    {
      title: 'Caisse',
      icon: CreditCard,
      route: '/cash-registers',
      menu: 'Caisse',
      description: 'Gestion de la caisse'
    },
    {
      title: 'Rapports',
      icon: BarChart3,
      route: '/reports',
      menu: 'Rapports',
      description: 'Rapports et analyses'
    },
    {
      title: 'Paramètres',
      icon: Settings,
      route: '/settings',
      menu: 'Paramètres',
      description: 'Paramètres système'
    }
  ];

  const accessibleMenus = menuItems.filter(item => 
    hasPermission(item.menu, undefined, 'read')
  );

  if (accessibleMenus.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Aucun menu accessible avec votre rôle actuel.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Menus disponibles</h3>
        {utilisateurInterne?.role?.nom && (
          <Badge variant="outline">{utilisateurInterne.role.nom}</Badge>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accessibleMenus.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.route} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="w-5 h-5" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  {item.description}
                </p>
                <Link
                  to={item.route}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Accéder →
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
