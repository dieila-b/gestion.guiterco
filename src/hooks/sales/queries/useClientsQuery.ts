
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Client } from '@/types/sales';

// Hook pour les clients avec plusieurs stratégies de récupération
export const useClientsQuery = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      console.log('🔍 Récupération des clients...');
      
      // Première tentative : requête normale
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('❌ Erreur lors de la récupération des clients:', error);
          
          // Si c'est une erreur RLS, essayons une requête plus simple
          if (error.message.includes('RLS') || error.message.includes('policy')) {
            console.log('🔄 Tentative de récupération simplifiée...');
            
            const { data: simpleData, error: simpleError } = await supabase
              .from('clients')
              .select('id, nom, email, telephone, type_client');
            
            if (!simpleError && simpleData) {
              console.log('✅ Clients récupérés (version simple):', simpleData.length);
              return simpleData as Client[];
            }
          }
          
          throw error;
        }
        
        console.log('✅ Clients récupérés:', data?.length || 0);
        return data as Client[];
      } catch (err) {
        console.error('💥 Erreur lors de la récupération des clients:', err);
        
        // Dernière tentative : requête de base absolue
        try {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('clients')
            .select('*');
          
          if (fallbackError) throw fallbackError;
          
          console.log('✅ Clients récupérés (fallback):', fallbackData?.length || 0);
          return (fallbackData as Client[]) || [];
        } catch (finalErr) {
          console.error('💥 Toutes les tentatives ont échoué:', finalErr);
          return [];
        }
      }
    },
    retry: 2,
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: true,
  });
};
