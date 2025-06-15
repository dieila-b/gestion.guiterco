import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateFactureStatut } from '@/hooks/sales/mutations/useFactureVenteMutations';
import { getActualDeliveryStatus } from '../table/StatusUtils';
import type { FactureVente } from '@/types/sales';

interface DeliverySectionProps {
  facture: FactureVente;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DeliverySection = ({ facture, open, onOpenChange }: DeliverySectionProps) => {
  const currentStatus = getActualDeliveryStatus(facture);
  const [statutLivraison, setStatutLivraison] = useState(currentStatus);
  
  const updateFactureStatut = useUpdateFactureStatut();

  const handleUpdateDeliveryStatus = () => {
    if (statutLivraison === currentStatus) return;

    updateFactureStatut.mutate({
      factureId: facture.id,
      statut_livraison: statutLivraison
    }, {
      onSuccess: () => {
        if (onOpenChange) onOpenChange(false);
      }
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

  const content = (
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

  // If open/onOpenChange props are provided, wrap in a Dialog
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gestion de la livraison</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise, return the content directly
  return content;
};

export default DeliverySection;
