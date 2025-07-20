
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  FileText, 
  Users, 
  CreditCard, 
  BarChart3, 
  PieChart, 
  Settings,
  ChevronDown,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';

const menuItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
    menu: 'Dashboard'
  },
  {
    name: 'Catalogue',
    icon: Package,
    path: '/catalogue',
    menu: 'Catalogue'
  },
  {
    name: 'Stock',
    icon: Warehouse,
    path: '/stock',
    menu: 'Stock',
    subItems: [
      { name: 'Entrepôts', path: '/stock/entrepots', submenu: 'Entrepôts' },
      { name: 'PDV', path: '/stock/pdv', submenu: 'PDV' },
      { name: 'Transferts', path: '/stock/transferts', submenu: 'Transferts' },
      { name: 'Entrées', path: '/stock/entrees', submenu: 'Entrées' },
      { name: 'Sorties', path: '/stock/sorties', submenu: 'Sorties' }
    ]
  },
  {
    name: 'Achats',
    icon: ShoppingCart,
    path: '/achats',
    menu: 'Achats',
    subItems: [
      { name: 'Bons de commande', path: '/achats/bons-commande', submenu: 'Bons de commande' },
      { name: 'Bons de livraison', path: '/achats/bons-livraison', submenu: 'Bons de livraison' },
      { name: 'Factures', path: '/achats/factures', submenu: 'Factures' }
    ]
  },
  {
    name: 'Ventes',
    icon: FileText,
    path: '/ventes',
    menu: 'Ventes',
    subItems: [
      { name: 'Factures', path: '/ventes/factures', submenu: 'Factures' },
      { name: 'Précommandes', path: '/ventes/precommandes', submenu: 'Précommandes' },
      { name: 'Devis', path: '/ventes/devis', submenu: 'Devis' },
      { name: 'Vente au Comptoir', path: '/ventes/comptoir', submenu: 'Vente au Comptoir' },
      { name: 'Factures impayées', path: '/ventes/impayes', submenu: 'Factures impayées' },
      { name: 'Retours Clients', path: '/ventes/retours', submenu: 'Retours Clients' }
    ]
  },
  {
    name: 'Clients',
    icon: Users,
    path: '/clients',
    menu: 'Clients'
  },
  {
    name: 'Caisse',
    icon: CreditCard,
    path: '/caisse',
    menu: 'Caisse',
    subItems: [
      { name: 'Dépenses', path: '/caisse/depenses', submenu: 'Dépenses' },
      { name: 'Aperçu du jour', path: '/caisse/apercu', submenu: 'Aperçu du jour' }
    ]
  },
  {
    name: 'Marges',
    icon: PieChart,
    path: '/marges',
    menu: 'Marges'
  },
  {
    name: 'Rapports',
    icon: BarChart3,
    path: '/rapports',
    menu: 'Rapports'
  },
  {
    name: 'Paramètres',
    icon: Settings,
    path: '/settings',
    menu: 'Paramètres',
    subItems: [
      { name: 'Utilisateurs', path: '/settings/users', submenu: 'Utilisateurs' },
      { name: 'Permissions', path: '/settings/permissions', submenu: 'Permissions' },
      { name: 'Fournisseurs', path: '/settings/fournisseurs', submenu: 'Fournisseurs' }
    ]
  }
];

const Sidebar = () => {
  const location = useLocation();
  const { canAccess } = usePermissionCheck();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  // Filtrer les éléments de menu selon les permissions
  const allowedMenuItems = menuItems.filter(item => 
    canAccess(item.menu)
  );

  return (
    <div className="w-64 bg-card border-r border-border h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Store className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">GestionPro</h1>
        </div>
      </div>

      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {allowedMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isExpanded = expandedItems.includes(item.name);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            
            // Filtrer les sous-éléments selon les permissions
            const allowedSubItems = hasSubItems 
              ? item.subItems!.filter(subItem => 
                  canAccess(item.menu, subItem.submenu)
                )
              : [];

            return (
              <li key={item.name}>
                <div
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => {
                    if (hasSubItems && allowedSubItems.length > 0) {
                      toggleExpanded(item.name);
                    }
                  }}
                >
                  <Link 
                    to={item.path} 
                    className="flex items-center space-x-3 flex-1"
                    onClick={(e) => {
                      if (hasSubItems && allowedSubItems.length > 0) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                  {hasSubItems && allowedSubItems.length > 0 && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded ? "rotate-180" : ""
                      )}
                    />
                  )}
                </div>

                {hasSubItems && allowedSubItems.length > 0 && isExpanded && (
                  <ul className="ml-6 mt-2 space-y-1">
                    {allowedSubItems.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <li key={subItem.name}>
                          <Link
                            to={subItem.path}
                            className={cn(
                              "block px-3 py-2 text-sm rounded-md transition-colors",
                              isSubActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
