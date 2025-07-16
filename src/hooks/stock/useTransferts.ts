
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Transfert } from '@/components/stock/types';

export const useTransferts = () => {
  const queryClient = useQueryClient();
  
  const { data: transferts, isLoading, error } = useQuery({
    queryKey: ['transferts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transferts')
        .select(`
          id,
          reference,
          article_id,
          entrepot_source_id,
          entrepot_destination_id,
          pdv_destination_id,
          quantite,
          statut,
          numero_transfert,
          date_expedition,
          date_reception,
          observations,
          created_at,
          created_by,
          article:catalogue!inner(
            id,
            reference,
            nom,
            description,
            categorie,
            unite_mesure,
            prix_unitaire,
            prix_achat,
            prix_vente,
            statut,
            seuil_alerte,
            created_at,
            updated_at
          ),
          entrepot_source:entrepots!entrepot_source_id(
            id,
            nom,
            adresse,
            gestionnaire,
            statut,
            capacite_max,
            created_at,
            updated_at
          ),
          entrepot_destination:entrepots!entrepot_destination_id(
            id,
            nom,
            adresse,
            gestionnaire,
            statut,
            capacite_max,
            created_at,
            updated_at
          ),
          pdv_destination:points_de_vente!pdv_destination_id(
            id,
            nom,
            adresse,
            responsable,
            statut,
            type_pdv,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data;
    }
  });

  const createTransfert = useMutation({
    mutationFn: async (newTransfert: Omit<Transfert, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('transferts')
        .insert(newTransfert)
        .select()
        .single();
      
      if (error) throw error;
      return data as Transfert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferts'] });
      toast({
        title: "Transfert créé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création du transfert",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateTransfert = useMutation({
    mutationFn: async ({ id, ...transfert }: Partial<Transfert> & { id: string }) => {
      // Récupérer les détails du transfert avant la mise à jour
      const { data: currentTransfert } = await supabase
        .from('transferts')
        .select(`
          *,
          article:catalogue!inner(id, nom)
        `)
        .eq('id', id)
        .single();

      if (!currentTransfert) throw new Error('Transfert non trouvé');

      // Mettre à jour le transfert
      const { data, error } = await supabase
        .from('transferts')
        .update(transfert)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Gérer les mouvements de stock selon le changement de statut
      if (transfert.statut !== currentTransfert.statut) {
        if (transfert.statut === 'expedie' && currentTransfert.statut !== 'expedie') {
          // Débiter l'entrepôt source lors de l'expédition
          await handleStockMovement(currentTransfert, 'expedie');
        }
        
        if (transfert.statut === 'recu' && currentTransfert.statut !== 'recu') {
          // Créditer la destination lors de la réception (sans redébiter la source)
          await handleStockMovement(currentTransfert, 'recu');
        }
      }

      return data as Transfert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferts'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      toast({
        title: "Transfert mis à jour avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la mise à jour du transfert",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Fonction pour gérer les mouvements de stock
  const handleStockMovement = async (transfert: any, newStatus: string) => {
    try {
      if (newStatus === 'expedie') {
        // Vérifier qu'il n'y a pas déjà une sortie de stock pour ce transfert
        const { data: existingSortie } = await supabase
          .from('sorties_stock')
          .select('id')
          .eq('numero_bon', `TRF-${transfert.reference || transfert.id.slice(0, 8)}`)
          .eq('type_sortie', 'transfert')
          .eq('article_id', transfert.article_id)
          .maybeSingle();

        if (!existingSortie) {
          // Débiter l'entrepôt source
          await supabase
            .from('sorties_stock')
            .insert({
              article_id: transfert.article_id,
              entrepot_id: transfert.entrepot_source_id,
              quantite: transfert.quantite,
              type_sortie: 'transfert',
              destination: transfert.entrepot_destination_id ? 'Entrepôt' : 'Point de vente',
              numero_bon: `TRF-${transfert.reference || transfert.id.slice(0, 8)}`,
              observations: `Transfert expédié vers ${transfert.entrepot_destination_id ? 'entrepôt' : 'PDV'}`,
              created_by: transfert.created_by || 'Système'
            });

          console.log(`Stock débité de l'entrepôt source pour le transfert ${transfert.id}`);
        } else {
          console.log(`Sortie de stock déjà existante pour le transfert ${transfert.id}`);
        }
      }

      if (newStatus === 'recu') {
        if (transfert.entrepot_destination_id) {
          // Créditer l'entrepôt destination
          await supabase
            .from('entrees_stock')
            .insert({
              article_id: transfert.article_id,
              entrepot_id: transfert.entrepot_destination_id,
              quantite: transfert.quantite,
              type_entree: 'transfert',
              numero_bon: `TRF-${transfert.reference || transfert.id.slice(0, 8)}`,
              fournisseur: 'Transfert interne',
              observations: `Transfert reçu de l'entrepôt source`,
              created_by: transfert.created_by || 'Système'
            });

          console.log(`Stock crédité à l'entrepôt destination pour le transfert ${transfert.id}`);
        } else if (transfert.pdv_destination_id) {
          // Créditer le point de vente
          const { data: existingStock } = await supabase
            .from('stock_pdv')
            .select('*')
            .eq('article_id', transfert.article_id)
            .eq('point_vente_id', transfert.pdv_destination_id)
            .single();

          if (existingStock) {
            // Mettre à jour le stock existant
            await supabase
              .from('stock_pdv')
              .update({
                quantite_disponible: existingStock.quantite_disponible + transfert.quantite,
                derniere_livraison: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('article_id', transfert.article_id)
              .eq('point_vente_id', transfert.pdv_destination_id);
          } else {
            // Créer une nouvelle entrée de stock
            await supabase
              .from('stock_pdv')
              .insert({
                article_id: transfert.article_id,
                point_vente_id: transfert.pdv_destination_id,
                quantite_disponible: transfert.quantite,
                quantite_minimum: 5,
                derniere_livraison: new Date().toISOString()
              });
          }

          console.log(`Stock crédité au point de vente pour le transfert ${transfert.id}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors du mouvement de stock:', error);
      throw error;
    }
  };

  return {
    transferts,
    isLoading,
    error,
    createTransfert,
    updateTransfert
  };
};
