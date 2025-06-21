
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
    { icon: Package, label: 'Stocks', href: '/stocks' },
    { icon: CreditCard, label: 'Achats', href: '/purchases' },
    { icon: ShoppingCart, label: 'Ventes', href: '/sales' },
    { icon: Users, label: 'Clients', href: '/clients' },
    { icon: DollarSign, label: 'Finances', href: '/cash-registers' },
    { icon: FileText, label: 'Rapports', href: '/reports' },
  ];

  const configItems = [
    { icon: Settings, label: 'Paramètres', href: '/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 h-full flex flex-col text-white">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">GestCompta</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-3 px-3">Menu principal</p>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-slate-700 text-white shadow-lg"
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
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-3 px-3">Configuration</p>
          <ul className="space-y-1">
            {configItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-slate-700 text-white shadow-lg"
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
        </div>
      </nav>
    </aside>
  );
};

export default AppSidebar;
