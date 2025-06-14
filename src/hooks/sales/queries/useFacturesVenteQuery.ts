
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente, VersementClient } from '@/types/sales';

// Define a type for the raw data structure, especially for the versements part
interface RawFactureVenteData extends Omit<FactureVente, 'versements' | 'client' | 'commande' | 'lignes_facture'> {
  client: FactureVente['client']; // Assuming Client type is correct
  commande: FactureVente['commande']; // Assuming CommandeClient type is correct
  lignes_facture: FactureVente['lignes_facture']; // Assuming LigneFactureVente[] type is correct
  versements: VersementClient[] | ({ error: true } & string) | undefined | null; // More specific type for raw versements
}

// Hook pour les factures de vente avec relations complètes et nombre d'articles
export const useFacturesVenteQuery = () => {
  return useQuery<FactureVente[], Error>({ // Specify Error type for the query
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
            client_id 
            /* facture_id removed from here as it's part of the join condition */
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching factures vente:', error);
        throw error;
      }
      
      console.log('Raw fetched factures vente data:', data);

      // Process data to handle potential error objects in versements
      const processedData = (data as RawFactureVenteData[]).map(facture => {
        // Check if versements is an error object
        if (facture.versements && typeof facture.versements === 'object' && 'error' in facture.versements && facture.versements.error === true) {
          console.warn(`Failed to fetch versements for facture ${facture.id}. Error details:`, facture.versements);
          return { ...facture, versements: [] }; // Replace error object with empty array
        }
        // Ensure versements is an array or undefined, not null
        if (facture.versements === null) {
          return { ...facture, versements: undefined };
        }
        return facture;
      });
      
      console.log('Processed factures vente with relations:', processedData);
      return processedData as FactureVente[];
    },
    staleTime: 30000, // Keep existing staleTime
    refetchOnWindowFocus: true, // Keep existing refetchOnWindowFocus
    refetchInterval: 60000 // Keep existing refetchInterval
  });
};

