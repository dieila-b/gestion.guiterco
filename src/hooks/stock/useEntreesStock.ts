

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EntreeStock } from '@/components/stock/types';

export const useEntreesStock = () => {
  const queryClient = useQueryClient();
  
  const { data: entrees, isLoading, error } = useQuery({
    queryKey: ['entrees-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entrees_stock')
        .select(`
          *,
          article:article_id(*),
          entrepot:entrepot_id(*),
          point_vente:point_vente_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      return data as EntreeStock[];
    }
  });

  const createEntree = useMutation({
    mutationFn: async (newEntree: Omit<EntreeStock, 'id' | 'created_at'>) => {
      console.log('🔄 Création entrée de stock:', newEntree);
      
      // Vérifier s'il existe déjà une entrée similaire aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const { data: existingEntries, error: checkError } = await supabase
        .from('entrees_stock')
        .select('*')
        .eq('article_id', newEntree.article_id)
        .eq('quantite', newEntree.quantite)
        .eq('type_entree', newEntree.type_entree)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);
      
      if (checkError) {
        console.warn('⚠️ Erreur vérification doublons:', checkError);
      }
      
      // Si une entrée similaire existe déjà aujourd'hui, demander confirmation
      if (existingEntries && existingEntries.length > 0) {
        const isDuplicate = existingEntries.some(entry => {
          const sameLocation = (entry.entrepot_id === newEntree.entrepot_id && 
                               entry.point_vente_id === newEntree.point_vente_id);
          const sameFournisseur = (entry.fournisseur || '') === (newEntree.fournisseur || '');
          return sameLocation && sameFournisseur;
        });
        
        if (isDuplicate) {
          throw new Error('Une entrée similaire existe déjà aujourd\'hui pour cet article. Vérifiez les doublons avant de continuer.');
        }
      }
      
      const { data, error } = await supabase
        .from('entrees_stock')
        .insert(newEntree)
        .select(`
          *,
          article:article_id(*),
          entrepot:entrepot_id(*),
          point_vente:point_vente_id(*)
        `)
        .single();
      
      if (error) {
        console.error('❌ Erreur création entrée:', error);
        throw error;
      }
      
      console.log('✅ Entrée créée avec succès:', data);
      return data as EntreeStock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrees-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-principal'] });
      queryClient.invalidateQueries({ queryKey: ['stock-pdv'] });
      toast({
        title: "Entrée de stock créée avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('❌ Erreur lors de la création:', error);
      toast({
        title: "Erreur lors de la création de l'entrée de stock",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    entrees,
    isLoading,
    error,
    createEntree
  };
};

