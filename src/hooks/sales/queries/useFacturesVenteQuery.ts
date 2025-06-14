
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

// Hook pour les factures de vente avec relations complètes et nombre d'articles
export const useFacturesVenteQuery = () => {
  return useQuery({
    queryKey: ['factures_vente'],
    queryFn: async () => {
      console.log('Fetching factures vente with enhanced relations (attempting fix for versements)...');
      
      const { data, error } = await supabase
        .from('factures_vente')
        .select(`
          *,
          client:clients!inner(
            id,
            nom,
            nom_entreprise,
            email,
            telephone,
            type_client,
            statut_client,
            created_at,
            updated_at
          ),
          commande:commandes_clients(
            id,
            numero_commande,
            date_commande,
            statut,
            montant_ht,
            montant_ttc,
            tva,
            taux_tva,
            mode_paiement,
            observations,
            created_at,
            updated_at
          ),
          lignes_facture:lignes_facture_vente(
            id,
            quantite,
            prix_unitaire,
            montant_ligne,
            created_at,
            facture_vente_id,
            article_id,
            article:catalogue(
              id,
              nom,
              reference
            )
          ),
          versements:versements_clients!facture_id( 
            id,
            numero_versement,
            montant,
            date_versement,
            mode_paiement,
            reference_paiement,
            observations,
            created_at,
            updated_at,
            client_id,
            facture_id 
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching factures vente:', error);
        throw error;
      }
      
      console.log('Fetched factures vente with relations:', data);
      return data as FactureVente[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchInterval: 60000 // Synchronisation temps réel
  });
};

