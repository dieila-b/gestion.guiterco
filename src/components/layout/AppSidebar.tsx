
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import {
  Archive,
  Calendar,
  ClipboardList,
  Database,
  List,
  Settings,
  Users,
} from 'lucide-react';

const mainMenu = [
  {
    title: "Dashboard",
    url: "/",
    icon: Database,
  },
  {
    title: "Stocks",
    url: "/stocks",
    icon: Archive,
  },
  {
    title: "Achats",
    url: "/purchases",
    icon: ClipboardList,
  },
  {
    title: "Ventes",
    url: "/sales",
    icon: List,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Caisses",
    url: "/cash-registers",
    icon: Calendar,
  },
];

const settingsMenu = [
  {
    title: "Paramètres",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (url: string) => {
    return location.pathname === url || 
           (url !== '/' && location.pathname.startsWith(url));
  };
  
  return (
    <Sidebar>
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-white">GestCompta</h1>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className={isActive(item.url) ? "bg-sidebar-accent" : ""}
                    asChild
                  >
                    <Link to={item.url} className="flex items-center">
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className={isActive(item.url) ? "bg-sidebar-accent" : ""}
                    asChild
                  >
                    <Link to={item.url}>
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/70">
        <p>GestCompta v1.0</p>
        <p>© 2025 Tous droits réservés</p>
      </div>
    </Sidebar>
  );
}
