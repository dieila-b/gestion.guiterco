
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useUpdateFactureVente } from '@/hooks/sales/mutations/useUpdateFactureVente';
import { useUpdateFactureStatut } from '@/hooks/sales/mutations/useUpdateFactureStatut';
import type { FactureVente } from '@/types/sales';

interface DeliverySectionProps {
  facture: FactureVente;
}

const DeliverySection = ({ facture }: DeliverySectionProps) => {
  const [statutLivraison, setStatutLivraison] = useState(facture.statut_livraison || 'En attente');
  const updateFacture = useUpdateFactureVente();
  const updateFactureStatut = useUpdateFactureStatut();

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

    // CORRECTION: Utiliser le hook approprié qui met à jour les lignes ET le statut
    updateFactureStatut.mutate({
      factureId: facture.id,
      statut_livraison: statutLivraison
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

  // CORRECTION: Calculer les quantités selon le statut sélectionné
  const getQuantitesPrevisionnelles = () => {
    if (statutLivraison === 'Livrée') {
      return {
        livree: totalQuantite,
        restante: 0
      };
    } else if (statutLivraison === 'En attente') {
      return {
        livree: 0,
        restante: totalQuantite
      };
    } else {
      // Pour statut actuel ou partiel, utiliser les vraies valeurs
      return {
        livree: totalLivree,
        restante: totalRestante
      };
    }
  };

  const quantitesPrevisionnelles = getQuantitesPrevisionnelles();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut de livraison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CORRECTION: Afficher les quantités prévisionnelles selon le statut sélectionné */}
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Quantités :</strong> {quantitesPrevisionnelles.livree}/{totalQuantite} articles livrés
          </div>
          <div className="text-sm text-muted-foreground">
            Restant à livrer : {quantitesPrevisionnelles.restante} articles
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

        {statutLivraison !== facture.statut_livraison && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Aperçu des changements :</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-1">
              <li>• Statut : {getDeliveryStatusLabel(facture.statut_livraison || 'En attente')} → {getDeliveryStatusLabel(statutLivraison)}</li>
              <li>• Quantités livrées : {totalLivree} → {quantitesPrevisionnelles.livree}</li>
              {statutLivraison === 'Livrée' && (
                <li className="text-green-700 font-medium">• Toutes les lignes seront marquées comme livrées</li>
              )}
              {statutLivraison === 'En attente' && (
                <li className="text-orange-700 font-medium">• Toutes les quantités livrées seront remises à 0</li>
              )}
            </ul>
          </div>
        )}

        <Button 
          onClick={handleUpdateDeliveryStatus}
          disabled={updateFactureStatut.isPending || statutLivraison === facture.statut_livraison}
          className="w-full"
        >
          {updateFactureStatut.isPending ? 'Mise à jour...' : 'Mettre à jour le statut'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeliverySection;
