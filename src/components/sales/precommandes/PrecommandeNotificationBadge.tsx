
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell, Package, CheckCircle } from 'lucide-react';
import type { NotificationPrecommande } from '@/types/precommandes';

interface PrecommandeNotificationBadgeProps {
  notifications: NotificationPrecommande[];
}

const PrecommandeNotificationBadge = ({ notifications }: PrecommandeNotificationBadgeProps) => {
  const newNotifications = notifications.filter(n => n.statut === 'en_attente');
  
  if (newNotifications.length === 0) return null;

  const stockNotifications = newNotifications.filter(n => n.type_notification === 'stock_disponible');
  
  if (stockNotifications.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <Package className="h-3 w-3 mr-1" />
        Stock disponible
      </Badge>
      
      {stockNotifications.length > 1 && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {stockNotifications.length} notifications
        </Badge>
      )}
    </div>
  );
};

export default PrecommandeNotificationBadge;
