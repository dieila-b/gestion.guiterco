
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Package, TrendingUp } from 'lucide-react';
import { useNotificationsPrecommandes } from '@/hooks/precommandes/useNotificationsPrecommandes';
import { useMarquerNotificationVue } from '@/hooks/precommandes/usePrecommandeMutations';

const PrecommandesAutomaticProcessing = () => {
  const { data: notifications, isLoading } = useNotificationsPrecommandes();
  const marquerVue = useMarquerNotificationVue();

  const notificationsRecentes = notifications?.filter(n => 
    n.type_notification === 'stock_disponible' && 
    n.statut === 'en_attente'
  ).slice(0, 10) || [];

  const handleMarquerVue = (notificationId: string) => {
    marquerVue.mutate(notificationId);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock_disponible':
        return <Package className="h-4 w-4 text-green-600" />;
      case 'livraison_generee':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'stock_disponible':
        return <Badge className="bg-green-100 text-green-800">Stock disponible</Badge>;
      case 'livraison_generee':
        return <Badge className="bg-blue-100 text-blue-800">Livraison générée</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Traitement automatique des précommandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Traitement automatique des précommandes
          {notificationsRecentes.length > 0 && (
            <Badge variant="destructive">{notificationsRecentes.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notificationsRecentes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Aucune notification récente de traitement automatique</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Notifications récentes de précommandes traitées automatiquement lors du retour en stock :
            </div>
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationsRecentes.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(notification.type_notification)}
                          {getTypeBadge(notification.type_notification)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          {notification.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(notification.date_creation).toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={notification.statut === 'en_attente' ? 'destructive' : 'secondary'}
                        >
                          {notification.statut === 'en_attente' ? 'Nouveau' : 'Vue'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {notification.statut === 'en_attente' && (
                          <button
                            onClick={() => handleMarquerVue(notification.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                            disabled={marquerVue.isPending}
                          >
                            Marquer vue
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrecommandesAutomaticProcessing;
