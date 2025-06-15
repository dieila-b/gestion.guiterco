
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateFactureStatut } from '@/hooks/sales/mutations/useFactureVenteMutations';
import { getActualDeliveryStatus } from '../table/StatusUtils';
import type { FactureVente } from '@/types/sales';

interface DeliverySectionProps {
  facture: FactureVente;
}

const DeliverySection = ({ facture }: DeliverySectionProps) => {
  const currentStatus = getActualDeliveryStatus(facture);
  const [statutLivraison, setStatutLivraison] = useState(currentStatus);
  
  const updateFactureStatut = useUpdateFactureStatut();

  const handleUpdateDeliveryStatus = () => {
    if (statutLivraison === currentStatus) return;

    updateFactureStatut.mutate({
      factureId: facture.id,
      statut_livraison: statutLivraison
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'partiellement_livree': return 'Partiellement livrée';
      case 'livree': return 'Livrée';
      default: return 'Non défini';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'text-orange-600';
      case 'partiellement_livree': return 'text-yellow-600';
      case 'livree': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut de livraison</CardTitle>
        <p className="text-sm text-muted-foreground">
          Statut actuel : <span className={`font-bold ${getStatusColor(currentStatus)}`}>
            {getStatusLabel(currentStatus)}
          </span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="statut_livraison">Nouveau statut</Label>
          <Select value={statutLivraison} onValueChange={setStatutLivraison}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="partiellement_livree">Partiellement livrée</SelectItem>
              <SelectItem value="livree">Livrée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleUpdateDeliveryStatus}
          disabled={updateFactureStatut.isPending || statutLivraison === currentStatus}
          className="w-full"
          variant={statutLivraison !== currentStatus ? "default" : "outline"}
        >
          {updateFactureStatut.isPending ? 'Mise à jour...' : 'Mettre à jour le statut'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeliverySection;
