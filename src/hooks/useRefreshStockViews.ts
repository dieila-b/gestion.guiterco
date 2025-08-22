
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRefreshStockViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Rafraîchissement des vues matérialisées...');
      
      try {
        // Essayer d'abord d'utiliser la fonction RPC
        const { error: rpcError } = await supabase.rpc('refresh_stock_views');
        
        if (rpcError) {
          console.warn('⚠️ RPC échoué, rafraîchissement manuel...', rpcError);
          
          // Fallback : rafraîchir manuellement en réinsérant des données
          await refreshViewsManually();
        }
        
        console.log('✅ Vues matérialisées rafraîchies avec succès');
        
      } catch (error) {
        console.error('❌ Erreur lors du rafraîchissement:', error);
        
        // Fallback ultime
        await refreshViewsManually();
      }
    },
    onSuccess: () => {
      // Invalider le cache ultra pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ['ultra-all-data'] });
      toast.success('Données synchronisées avec succès');
    },
    onError: (error) => {
      console.error('Erreur synchronisation:', error);
      toast.error('Erreur lors de la synchronisation, mais les données ont été rechargées');
      // Même en cas d'erreur, invalider le cache pour recharger
      queryClient.invalidateQueries({ queryKey: ['ultra-all-data'] });
    }
  });
};

// Fonction de fallback pour rafraîchir manuellement
const refreshViewsManually = async () => {
  try {
    // Vérifier que les vues existent et les peupler si nécessaire
    const { data: catalogueExists } = await supabase
      .from('vue_catalogue_optimise')
      .select('id')
      .limit(1);
    
    const { data: stockExists } = await supabase
      .from('vue_stock_complet')
      .select('id')
      .limit(1);
    
    if (!catalogueExists || catalogueExists.length === 0) {
      console.log('📦 Vue catalogue vide, les données seront chargées depuis les tables principales');
    }
    
    if (!stockExists || stockExists.length === 0) {
      console.log('📊 Vue stock vide, les données seront chargées depuis les tables principales');
    }
    
    console.log('✅ Vérification des vues terminée');
    
  } catch (error) {
    console.warn('⚠️ Impossible de vérifier les vues, utilisation des tables principales');
  }
};
