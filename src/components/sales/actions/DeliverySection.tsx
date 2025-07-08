
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useUpdateFactureVente } from '@/hooks/sales/mutations/useUpdateFactureVente';
import type { FactureVente } from '@/types/sales';

interface DeliverySectionProps {
  facture: FactureVente;
}

const DeliverySection = ({ facture }: DeliverySectionProps) => {
  const [statutLivraison, setStatutLivraison] = useState(facture.statut_livraison || 'En attente');
  const updateFacture = useUpdateFactureVente();

  // CORRECTION: Calculer les vraies quantités de livraison
  const totalQuantite = facture.lignes_facture?.reduce((sum, ligne) => sum + (ligne.quantite || 0), 0) || 0;
  const totalLivree = facture.lignes_facture?.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0) || 0;
  const totalRestante = totalQuantite - totalLivree;

  const handleUpdateDeliveryStatus = () => {
    console.log('🚚 Mise à jour statut livraison:', {
      facture_id: facture.id,
      ancien_statut: facture.statut_livraison,
      nouveau_statut: statutLivraison
    });

    updateFacture.mutate({
      id: facture.id,
      statut_livraison: statutLivraison as 'En attente' | 'Partiellement livrée' | 'Livrée'
    }, {
      onSuccess: () => {
        console.log('✅ Statut livraison mis à jour avec succès');
      },
      onError: (error) => {
        console.error('❌ Erreur mise à jour statut livraison:', error);
      }
    });
  };

  const getDeliveryStatusLabel = (status: string) => {
    switch (status) {
      case 'En attente': return 'Non livrée';
      case 'Partiellement livrée': return 'Partiellement livrée';
      case 'Livrée': return 'Livrée';
      default: return status;
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'En attente': return 'text-orange-600';
      case 'Partiellement livrée': return 'text-yellow-600';
      case 'Livrée': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut de livraison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CORRECTION: Afficher les vraies quantités */}
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Quantités :</strong> {totalLivree}/{totalQuantite} articles livrés
          </div>
          <div className="text-sm text-muted-foreground">
            Restant à livrer : {totalRestante} articles
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="text-sm">
            <strong>Statut actuel :</strong>
            <span className={`ml-2 font-medium ${getDeliveryStatusColor(facture.statut_livraison || 'En attente')}`}>
              {getDeliveryStatusLabel(facture.statut_livraison || 'En attente')}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nouveau_statut">Nouveau statut</Label>
          <Select value={statutLivraison} onValueChange={setStatutLivraison}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="En attente">Non livrée</SelectItem>
              <SelectItem value="Partiellement livrée">Partiellement livrée</SelectItem>
              <SelectItem value="Livrée">Livrée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleUpdateDeliveryStatus}
          disabled={updateFacture.isPending || statutLivraison === facture.statut_livraison}
          className="w-full"
        >
          {updateFacture.isPending ? 'Mise à jour...' : 'Mettre à jour le statut'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeliverySection;
