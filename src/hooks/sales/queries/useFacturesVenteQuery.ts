
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente, VersementClient, Client, CommandeClient, LigneFactureVente } from '@/types/sales';

// Define a type for the raw data structure
// The 'versements' field can be an array, null, undefined, or an error object from Supabase parsing.
interface RawFactureVenteData extends Omit<FactureVente, 'versements' | 'client' | 'commande' | 'lignes_facture'> {
  client: Client | null; // Client can be null if not found with !inner (though !inner should filter)
  commande: CommandeClient | null; // Commande can be null if left joined and not found
  lignes_facture: LigneFactureVente[]; // Assuming lignes_facture is always an array (possibly empty)
  versements: VersementClient[] | { error: true; [key: string]: any; } | null | undefined;
}

// Hook pour les factures de vente avec relations complètes et nombre d'articles
export const useFacturesVenteQuery = () => {
  return useQuery<FactureVente[], Error>({
    queryKey: ['factures_vente'],
    queryFn: async () => {
      console.log('Fetching factures vente with enhanced relations (attempting fix for versements)...');
      
      const { data: supabaseData, error: supabaseError } = await supabase
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
          versements:versements_clients( /* Changed to left join from versements_clients!facture_id */
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
          )
        `)
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        console.error('Error fetching factures vente:', supabaseError);
        throw supabaseError;
      }
      
      if (!Array.isArray(supabaseData)) {
        console.error('Supabase data is not an array:', supabaseData);
        // This could be a top-level ParserError if the entire query result is malformed.
        if (supabaseData && typeof supabaseData === 'object' && 'error' in supabaseData && (supabaseData as any).error === true) {
          throw new Error(`Failed to parse factures data: ${(supabaseData as any).message || JSON.stringify(supabaseData)}`);
        }
        throw new Error('Received non-array data from Supabase for factures_vente query.');
      }
      
      console.log('Raw fetched factures vente data:', supabaseData);

      // Process data more defensively
      const processedData = (supabaseData as any[]).reduce((acc: FactureVente[], rawItem: any) => {
        // Check if rawItem itself is a ParserError object (e.g., a row failed to parse)
        if (rawItem && typeof rawItem === 'object' && 'error' in rawItem && rawItem.error === true) {
          console.warn(`Skipping a facture entry due to parsing error for the row:`, rawItem);
          return acc;
        }

        const facture = rawItem as RawFactureVenteData;
        let finalVersements: VersementClient[];

        if (facture.versements === null || facture.versements === undefined) {
          finalVersements = [];
        } else if (Array.isArray(facture.versements)) {
          finalVersements = facture.versements;
        } else if (typeof facture.versements === 'object' && 'error' in facture.versements && (facture.versements as any).error === true) {
          console.warn(`Versements field for facture ${facture.id} contained an error object, defaulting to empty. Error:`, facture.versements);
          finalVersements = [];
        } else {
          console.warn(`Versements field for facture ${facture.id} is of unexpected type, defaulting to empty. Value:`, facture.versements);
          finalVersements = [];
        }
        
        acc.push({
          ...facture,
          client: facture.client || undefined, // Ensure client is undefined if null (though inner join makes it non-null)
          commande: facture.commande || undefined, // Ensure commande is undefined if null
          versements: finalVersements,
        } as FactureVente); // Cast to final FactureVente type
        return acc;
      }, []);
      
      console.log('Processed factures vente with relations:', processedData);
      return processedData;
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchInterval: 60000
  });
};

