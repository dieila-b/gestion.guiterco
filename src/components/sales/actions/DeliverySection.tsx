
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateFactureStatut } from '@/hooks/sales/mutations';
import { useUpdateFactureStatutPartiel } from '@/hooks/sales/mutations/useUpdateFactureStatutPartiel';
import { getActualDeliveryStatus } from '../table/StatusUtils';
import PartialDeliveryModal from './PartialDeliveryModal';
import type { FactureVente } from '@/types/sales';

interface DeliverySectionProps {
  facture: FactureVente;
}

const DeliverySection = ({ facture }: DeliverySectionProps) => {
  const currentStatus = getActualDeliveryStatus(facture);
  const [statutLivraison, setStatutLivraison] = useState(currentStatus);
  const [showPartialModal, setShowPartialModal] = useState(false);
  
  const updateFactureStatut = useUpdateFactureStatut();
  const updateFactureStatutPartiel = useUpdateFactureStatutPartiel();

  // Calculer les quantités actuelles pour détecter si des changements sont possibles
  const getQuantitiesInfo = () => {
    if (!facture.lignes_facture || facture.lignes_facture.length === 0) {
      return { totalCommande: 0, totalLivree: 0, canModify: false };
    }

    const totalCommande = facture.lignes_facture.reduce((sum, ligne) => sum + ligne.quantite, 0);
    const totalLivree = facture.lignes_facture.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);
    
    // On peut toujours modifier tant que la livraison n'est pas complète
    const canModify = totalLivree < totalCommande;

    return { totalCommande, totalLivree, canModify };
  };

  const { totalCommande, totalLivree, canModify } = getQuantitiesInfo();

  const handleUpdateDeliveryStatus = async () => {
    // Si on choisit "partiellement_livree", ouvrir le modal de saisie détaillée
    if (statutLivraison === 'partiellement_livree') {
      setShowPartialModal(true);
      return;
    }

    console.log('🔄 Mise à jour statut de livraison:', {
      factureId: facture.id,
      currentStatus,
      newStatus: statutLivraison,
      totalCommande,
      totalLivree
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

  const handlePartialDeliveryConfirm = async (quantitesLivrees: Record<string, number>) => {
    try {
      await updateFactureStatutPartiel.mutateAsync({
        factureId: facture.id,
        quantitesLivrees
      });
      setShowPartialModal(false);
      console.log('✅ Livraison partielle enregistrée avec succès');
    } catch (error) {
      console.error('❌ Erreur livraison partielle:', error);
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

  // Logique pour déterminer si des changements sont possibles
  const hasChanges = statutLivraison !== currentStatus;
  const isLoading = updateFactureStatut.isPending || updateFactureStatutPartiel.isPending;
  
  // Permettre les modifications si :
  // 1. Le statut sélectionné est différent du statut actuel
  // 2. OU on peut encore modifier les livraisons (pas encore complètement livré)
  const canMakeChanges = hasChanges || canModify || currentStatus !== 'livree';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Statut de livraison</CardTitle>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Statut actuel : <span className={`font-bold ${getStatusColor(currentStatus)}`}>
                {getStatusLabel(currentStatus)}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Quantités : {totalLivree}/{totalCommande} articles livrés
            </p>
            {facture.statut_livraison_id && (
              <p className="text-xs text-blue-600">
                ID statut: {facture.statut_livraison_id}
              </p>
            )}
          </div>
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
            disabled={isLoading || !canMakeChanges}
            className={`w-full ${canMakeChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            variant={canMakeChanges ? "default" : "outline"}
          >
            {isLoading 
              ? 'Mise à jour...' 
              : !canMakeChanges
                ? 'Livraison terminée'
                : statutLivraison === 'partiellement_livree' 
                  ? 'Saisir les quantités' 
                  : 'Mettre à jour le statut'
            }
          </Button>

          {hasChanges && (
            <p className="text-sm text-blue-600 text-center">
              Changement : {getStatusLabel(currentStatus)} → {getStatusLabel(statutLivraison)}
            </p>
          )}

          {canModify && currentStatus === 'partiellement_livree' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                💡 Livraison incomplète : vous pouvez compléter ou modifier les quantités
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <PartialDeliveryModal
        isOpen={showPartialModal}
        onClose={() => setShowPartialModal(false)}
        facture={facture}
        onConfirm={handlePartialDeliveryConfirm}
        isLoading={updateFactureStatutPartiel.isPending}
      />
    </>
  );
};

export default DeliverySection;
