
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
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AppSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Tableau de bord', href: '/' },
    { icon: ShoppingCart, label: 'Ventes', href: '/sales' },
    { icon: Package, label: 'Stocks', href: '/stocks' },
    { icon: CreditCard, label: 'Achats', href: '/purchases' },
    { icon: Users, label: 'Clients', href: '/clients' },
    { icon: DollarSign, label: 'Caisse', href: '/cash-registers' },
    { icon: TrendingUp, label: 'Marges', href: '/margins' },
    { icon: FileText, label: 'Rapports', href: '/reports' },
    { icon: Settings, label: 'Paramètres', href: '/settings' },
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
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default AppSidebar;
