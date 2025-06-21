
import React from 'react';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings,
  DollarSign,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AppSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Tableau de Bord', href: '/' },
    { icon: Package, label: 'Stocks', href: '/stocks' },
    { icon: ShoppingCart, label: 'Achats', href: '/purchases' },
    { icon: TrendingUp, label: 'Ventes', href: '/sales' },
    { icon: Users, label: 'Clients', href: '/clients' },
    { icon: DollarSign, label: 'Finances', href: '/cash-registers' },
    { icon: FileText, label: 'Rapports', href: '/reports' },
  ];

  const configurationItems = [
    { icon: Settings, label: 'Paramètres', href: '/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-white h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">GestCompta</h1>
        <p className="text-xs text-slate-400 mt-1">v1.0</p>
      </div>
      
      {/* Main Menu */}
      <nav className="flex-1 p-4">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Menu principal
          </h3>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Configuration Section */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Configuration
          </h3>
          <ul className="space-y-1">
            {configurationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          © 2025 Tous droits réservés
        </p>
      </div>
    </aside>
  );
};

export default AppSidebar;
