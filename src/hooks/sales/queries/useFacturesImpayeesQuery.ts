
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FactureImpayee {
  facture_id: string;
  numero_facture: string;
  date_iso: string;
  client: string;
  total: number;
  paye: number;
  restant: number;
  statut_paiement: string;
  statut_livraison: string;
  articles: number;
}

export const useFacturesImpayeesQuery = () => {
  return useQuery({
    queryKey: ['factures_impayees_complete'],
    queryFn: async () => {
      console.log('🔍 Fetching factures impayées depuis la vue corrigée...');
      
      // Utiliser la vue corrigée avec les bons filtres
      const { data, error } = await supabase
        .from('vue_factures_impayees_summary')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('❌ Erreur requête vue factures impayées:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('✅ Aucune facture impayée trouvée (c\'est normal si toutes sont payées)');
        return [];
      }

      // Transformer les données pour correspondre à l'interface
      const transformedData = data.map(facture => ({
        facture_id: facture.facture_id,
        numero_facture: facture.numero_facture,
        date_iso: facture.date_iso, // Utiliser date_iso du SQL
        client: facture.client,
        total: facture.total,
        paye: facture.paye,
        restant: facture.restant,
        statut_paiement: facture.statut_paiement,
        statut_livraison: facture.statut_livraison,
        articles: facture.articles
      }));
      
      console.log(`✅ Factures impayées trouvées: ${transformedData.length} factures`);
      console.log('📊 Échantillon des données:', transformedData.slice(0, 2));
      
      return transformedData as FactureImpayee[];
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    staleTime: 10000, // Considérer les données comme fraîches pendant 10 secondes
  });
};
