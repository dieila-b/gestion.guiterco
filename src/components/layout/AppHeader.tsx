
import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'react-router-dom';

interface AppHeaderProps {
  title?: string;
}

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/stocks': 'Gestion des stocks',
  '/purchases': 'Achats',
  '/sales': 'Ventes et facturation',
  '/clients': 'Clients',
  '/cash-registers': 'Caisses',
  '/settings': 'Paramètres',
};

export function AppHeader({ title }: AppHeaderProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { toast } = useToast();
  
  const pageTitle = title || routeTitles[location.pathname] || 'GestCompta';

  const handleNotification = () => {
    toast({
      title: "Notification",
      description: "Pas de nouvelles notifications pour le moment.",
    });
  };

  return (
    <header className="h-16 border-b border-border bg-background flex items-center px-4 sticky top-0 z-10">
      <div className="flex items-center">
        {isMobile && <SidebarTrigger />}
        <h1 className="text-xl font-bold ml-2">{pageTitle}</h1>
      </div>
      
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNotification}
          className="hidden sm:flex"
        >
          Notifications
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex"
        >
          Mon compte
        </Button>
      </div>
    </header>
  );
}
