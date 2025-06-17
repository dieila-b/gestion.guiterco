
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateFactureStatut } from '@/hooks/sales/mutations';
import { getActualDeliveryStatus } from '../table/StatusUtils';
import type { FactureVente } from '@/types/sales';

interface DeliverySectionProps {
  facture: FactureVente;
}

const DeliverySection = ({ facture }: DeliverySectionProps) => {
  const currentStatus = getActualDeliveryStatus(facture);
  const [statutLivraison, setStatutLivraison] = useState(currentStatus);
  
  const updateFactureStatut = useUpdateFactureStatut();

  const handleUpdateDeliveryStatus = async () => {
    if (statutLivraison === currentStatus) {
      console.log('⚠️ Aucun changement de statut nécessaire');
      return;
    }

    console.log('🔄 Mise à jour statut de livraison:', {
      factureId: facture.id,
      currentStatus,
      newStatus: statutLivraison
    });

    try {
      await updateFactureStatut.mutateAsync({
        factureId: facture.id,
        statut_livraison: statutLivraison
      });
      console.log('✅ Statut livraison mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
    }
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

  const hasChanges = statutLivraison !== currentStatus;

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
          disabled={updateFactureStatut.isPending || !hasChanges}
          className={`w-full ${hasChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          variant={hasChanges ? "default" : "outline"}
        >
          {updateFactureStatut.isPending 
            ? 'Mise à jour...' 
            : hasChanges 
              ? 'Mettre à jour le statut' 
              : 'Aucun changement'
          }
        </Button>

        {hasChanges && (
          <p className="text-sm text-blue-600 text-center">
            Changement : {getStatusLabel(currentStatus)} → {getStatusLabel(statutLivraison)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliverySection;
