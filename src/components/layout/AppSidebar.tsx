
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
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">ERP Business</h1>
      </div>
      
      <nav className="flex-1 p-4">
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
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
