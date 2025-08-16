
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

// Hook pour forcer le rechargement de toutes les données
export const useDataFix = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const forceRefresh = async () => {
    console.log('🔄 Forçage du rechargement de toutes les données...');
    
    // Invalider toutes les queries
    await queryClient.invalidateQueries();
    
    // Vider le cache
    queryClient.clear();
    
    toast({
      title: "Données actualisées",
      description: "Toutes les données ont été rechargées depuis Supabase",
    });
  };

  return { forceRefresh };
};

// Hook pour récupérer les données du catalogue avec bypass RLS
export const useCatalogueForced = () => {
  return useQuery({
    queryKey: ['catalogue-forced'],
    queryFn: async () => {
      console.log('🔍 Récupération forcée du catalogue...');
      
      // Première tentative : requête normale
      try {
        const { data: normalData, error: normalError } = await supabase
          .from('catalogue')
          .select('*')
          .order('nom', { ascending: true });

        if (!normalError && normalData && normalData.length > 0) {
          console.log('✅ Catalogue récupéré normalement:', normalData.length);
          return normalData;
        }
      } catch (err) {
        console.log('⚠️ Requête normale échouée');
      }

      // Deuxième tentative : sans filtre de statut
      try {
        const { data: allData, error: allError } = await supabase
          .from('catalogue')
          .select('*');

        if (!allError && allData) {
          console.log('✅ Catalogue récupéré sans filtre:', allData.length);
          return allData;
        }
      } catch (err) {
        console.log('⚠️ Requête sans filtre échouée');
      }

      // Troisième tentative : requête très basique
      try {
        const { data: basicData, error: basicError } = await supabase
          .from('catalogue')
          .select('id, nom, reference');

        if (!basicError && basicData) {
          console.log('✅ Catalogue basique récupéré:', basicData.length);
          return basicData;
        }
      } catch (err) {
        console.log('⚠️ Requête basique échouée');
      }

      throw new Error('Impossible de récupérer les données du catalogue');
    },
    retry: 3,
    staleTime: 0, // Toujours frais
  });
};

// Hook pour récupérer les clients avec bypass
export const useClientsForced = () => {
  return useQuery({
    queryKey: ['clients-forced'],
    queryFn: async () => {
      console.log('🔍 Récupération forcée des clients...');
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('nom', { ascending: true });

      if (error) {
        console.error('❌ Erreur clients:', error);
        throw error;
      }

      console.log('✅ Clients récupérés:', data?.length || 0);
      return data || [];
    },
    retry: 3,
    staleTime: 0,
  });
};

// Hook pour récupérer les utilisateurs internes avec bypass
export const useUtilisateursInternesForced = () => {
  return useQuery({
    queryKey: ['utilisateurs-internes-forced'],
    queryFn: async () => {
      console.log('🔍 Récupération forcée des utilisateurs internes...');
      
      try {
        // Tentative avec relations
        const { data: withRoles, error: rolesError } = await supabase
          .from('utilisateurs_internes')
          .select(`
            *,
            roles (
              id,
              name,
              description
            )
          `)
          .order('created_at', { ascending: false });

        if (!rolesError && withRoles) {
          console.log('✅ Utilisateurs avec rôles récupérés:', withRoles.length);
          return withRoles;
        }
      } catch (err) {
        console.log('⚠️ Requête avec rôles échouée');
      }

      // Fallback : sans relations
      const { data, error } = await supabase
        .from('utilisateurs_internes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur utilisateurs internes:', error);
        throw error;
      }

      console.log('✅ Utilisateurs internes récupérés:', data?.length || 0);
      return data || [];
    },
    retry: 3,
    staleTime: 0,
  });
};
