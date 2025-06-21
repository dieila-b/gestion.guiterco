
import React from 'react';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings,
  DollarSign,
  FileText,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const location = useLocation();

  const mainMenuItems = [
    { icon: BarChart3, label: 'Tableau de bord', href: '/' },
    { icon: Package, label: 'Stocks', href: '/stocks' },
    { icon: CreditCard, label: 'Achats', href: '/purchases' },
    { icon: ShoppingCart, label: 'Ventes', href: '/sales' },
    { icon: Users, label: 'Clients', href: '/clients' },
    { icon: DollarSign, label: 'Finances', href: '/cash-registers' },
    { icon: FileText, label: 'Rapports', href: '/reports' },
  ];

  const configMenuItems = [
    { icon: Settings, label: 'Paramètres', href: '/settings' },
  ];

  return (
    <Sidebar className="bg-sidebar border-r-0">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-sidebar-foreground">GestCompta</h1>
      </div>
      
      <SidebarContent className="bg-sidebar">
        {/* Menu principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium px-3 py-2">
            Menu principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild className={cn(
                      "w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-accent",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                    )}>
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configuration */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium px-3 py-2">
            Configuration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configMenuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild className={cn(
                      "w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-accent",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                    )}>
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className="text-xs text-sidebar-foreground/60">
          <div>GestCompta v1.0</div>
          <div>© 2025 Tous droits réservés</div>
        </div>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
