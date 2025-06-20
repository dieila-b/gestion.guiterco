
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Check, AlertCircle, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { NotificationPrecommande } from '@/types/precommandes';

interface PrecommandeNotificationsProps {
  notifications: NotificationPrecommande[];
  onMarquerVue: (notificationId: string) => void;
}

const PrecommandeNotifications = ({ notifications, onMarquerVue }: PrecommandeNotificationsProps) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'stock_disponible': return <AlertCircle className="h-4 w-4" />;
      case 'livraison_generee': return <Truck className="h-4 w-4" />;
      case 'livraison_confirmee': return <Check className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string, statut: string) => {
    if (statut === 'en_attente') return 'destructive';
    switch (type) {
      case 'stock_disponible': return 'default';
      case 'livraison_generee': return 'secondary';
      case 'livraison_confirmee': return 'outline';
      default: return 'default';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-muted-foreground">Notifications récentes</h4>
      </div>
      <div className="space-y-2">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {getNotificationIcon(notification.type_notification)}
              <span className="flex-1">{notification.message}</span>
              <Badge variant={getNotificationColor(notification.type_notification, notification.statut) as any}>
                {notification.statut === 'en_attente' ? 'Nouvelle' : 'Vue'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {format(new Date(notification.date_creation), 'dd/MM HH:mm', { locale: fr })}
              </span>
              {notification.statut === 'en_attente' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onMarquerVue(notification.id)}
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrecommandeNotifications;
