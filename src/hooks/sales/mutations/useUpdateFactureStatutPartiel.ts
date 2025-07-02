
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUpdateFactureStatutPartiel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      factureId, 
      quantitesLivrees 
    }: { 
      factureId: string, 
      quantitesLivrees: Record<string, number> 
    }) => {
      console.log('🚚 Mise à jour livraison partielle pour facture:', factureId);
      console.log('📦 Quantités livrées (nouvelles valeurs absolues):', quantitesLivrees);

      // Récupérer les lignes de facture pour traitement
      const { data: lignesFacture, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .select('*')
        .eq('facture_vente_id', factureId);

      if (lignesError) {
        console.error('❌ Erreur récupération lignes facture:', lignesError);
        throw lignesError;
      }

      if (!lignesFacture || lignesFacture.length === 0) {
        console.error('❌ Aucune ligne de facture trouvée pour:', factureId);
        throw new Error('Aucune ligne de facture trouvée');
      }

      console.log('📦 Lignes facture récupérées:', lignesFacture.length);

      // Mettre à jour chaque ligne avec les quantités livrées ET le statut
      const updates = [];
      for (const ligne of lignesFacture) {
        // IMPORTANT: Les quantités saisies sont les nouvelles valeurs absolues (pas des cumuls)
        const nouvelleQuantiteLivree = quantitesLivrees[ligne.article_id] || 0;
        let nouveauStatut = 'en_attente';
        
        if (nouvelleQuantiteLivree > 0) {
          nouveauStatut = nouvelleQuantiteLivree >= ligne.quantite ? 'livree' : 'partiellement_livree';
        }

        console.log(`📦 Ligne ${ligne.id}: ${nouvelleQuantiteLivree}/${ligne.quantite} → ${nouveauStatut}`);

        // CRUCIAL: Remplacer (pas ajouter) la quantité livrée
        const { error: updateError } = await supabase
          .from('lignes_facture_vente')
          .update({ 
            quantite_livree: nouvelleQuantiteLivree,
            statut_livraison: nouveauStatut 
          })
          .eq('id', ligne.id);

        if (updateError) {
          console.error('❌ Erreur mise à jour ligne:', updateError);
          throw updateError;
        }

        updates.push({ ligne: ligne.id, quantite_livree: nouvelleQuantiteLivree, statut: nouveauStatut });
      }

      // Calculer le statut global de la facture basé sur les quantités réellement livrées
      const totalLignes = lignesFacture.length;
      const lignesAvecQuantite = Object.values(quantitesLivrees).filter(qty => qty > 0).length;
      const lignesCompletes = lignesFacture.filter(ligne => {
        const qtyLivree = quantitesLivrees[ligne.article_id] || 0;
        return qtyLivree >= ligne.quantite;
      }).length;

      let statutGlobal = 'en_attente';
      if (lignesCompletes === totalLignes && lignesAvecQuantite > 0) {
        statutGlobal = 'livree';
      } else if (lignesAvecQuantite > 0) {
        statutGlobal = 'partiellement_livree';
      }

      // Obtenir l'ID du statut de livraison
      const { data: statutData, error: statutError } = await supabase
        .from('livraison_statut')
        .select('id')
        .eq('nom', statutGlobal)
        .single();

      if (statutError) {
        console.error('❌ Erreur récupération statut livraison:', statutError);
        throw statutError;
      }

      const statutLivraisonId = statutData.id;

      console.log('🚚 Calcul statut global:', {
        totalLignes,
        lignesAvecQuantite,
        lignesCompletes,
        statutGlobal,
        statutLivraisonId
      });

      // Mettre à jour le statut global de la facture
      const { data: facture, error: factureError } = await supabase
        .from('factures_vente')
        .update({ statut_livraison_id: statutLivraisonId })
        .eq('id', factureId)
        .select()
        .single();

      if (factureError) {
        console.error('❌ Erreur mise à jour facture:', factureError);
        throw factureError;
      }

      console.log('✅ Livraison partielle mise à jour avec succès');
      console.log('📊 Résumé des mises à jour:', {
        factureId,
        nouveauStatutFacture: statutGlobal,
        lignesModifiees: updates.length,
        updates
      });
      
      return {
        facture,
        lignesModifiees: updates.length,
        nouveauStatut: statutGlobal
      };
    },
    onSuccess: (result) => {
      // Invalider toutes les queries liées aux factures pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: ['factures_vente'] });
      
      // Invalider aussi les queries spécifiques si elles existent
      queryClient.invalidateQueries({ queryKey: ['facture', result.facture.id] });
      
      // Forcer le refetch immédiat
      queryClient.refetchQueries({ queryKey: ['factures_vente'] });
      
      toast.success(`Livraison mise à jour - ${result.lignesModifiees} ligne(s) modifiée(s)`);
      
      console.log('✅ Queries invalidées et rafraîchies après livraison partielle');
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la mise à jour de la livraison partielle:', error);
      toast.error('Erreur lors de la mise à jour de la livraison partielle');
    }
  });
};
