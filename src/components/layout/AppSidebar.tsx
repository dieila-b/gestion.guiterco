
import React from 'react';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings,
  DollarSign,
  FileText,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import ProtectedMenuItem from './ProtectedMenuItem';
import { useRealTimePermissions } from '@/hooks/useRealTimePermissions';

const AppSidebar = () => {
  // Activer la surveillance temps réel des permissions
  useRealTimePermissions();

  const menuItems = [
    { 
      icon: Home, 
      label: 'Tableau de bord', 
      href: '/', 
      menu: 'Dashboard'
    },
    { 
      icon: ShoppingCart, 
      label: 'Ventes', 
      href: '/sales', 
      menu: 'Ventes',
      submenu: 'Factures'
    },
    { 
      icon: Package, 
      label: 'Stocks', 
      href: '/stocks', 
      menu: 'Stock',
      submenu: 'Entrepôts'
    },
    { 
      icon: CreditCard, 
      label: 'Achats', 
      href: '/purchases', 
      menu: 'Achats',
      submenu: 'Bons de commande'
    },
    { 
      icon: Users, 
      label: 'Clients', 
      href: '/clients', 
      menu: 'Clients'
    },
    { 
      icon: DollarSign, 
      label: 'Caisse', 
      href: '/cash-registers', 
      menu: 'Caisse'
    },
    { 
      icon: TrendingUp, 
      label: 'Marges', 
      href: '/margins', 
      menu: 'Marges'
    },
    { 
      icon: FileText, 
      label: 'Rapports', 
      href: '/reports', 
      menu: 'Rapports'
    },
    { 
      icon: Settings, 
      label: 'Paramètres', 
      href: '/settings', 
      menu: 'Paramètres'
    },
  ];

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 h-full flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">ERP Business</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="mb-4">
          <p className="text-slate-400 text-sm mb-3">Menu principal</p>
        </div>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <ProtectedMenuItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              menu={item.menu}
              submenu={item.submenu}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AppSidebar;
