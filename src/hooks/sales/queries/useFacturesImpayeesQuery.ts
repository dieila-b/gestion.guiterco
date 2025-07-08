
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FactureImpayee {
  facture_id: string;
  numero_facture: string;
  date_iso: string;
  client_id: string;
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
      console.log('🔍 Fetching factures impayées avec client_id...');
      
      // Récupérer directement depuis factures_vente avec les calculs nécessaires
      const { data, error } = await supabase
        .from('factures_vente')
        .select(`
          id,
          numero_facture,
          date_facture,
          client_id,
          montant_ttc,
          statut_paiement,
          statut_livraison,
          clients!inner(nom),
          versements_clients(montant),
          lignes_facture_vente(id)
        `)
        .in('statut_paiement', ['en_attente', 'partiellement_payee'])
        .order('date_facture', { ascending: false });
      
      console.log('📊 Résultat requête factures impayées:', { data, error });
      
      if (error) {
        console.error('❌ Erreur requête factures impayées:', error);
        throw error;
      }
      
      // Transformer les données pour correspondre à l'interface
      const transformedData = data?.map(facture => {
        const paye = facture.versements_clients?.reduce((sum, v) => sum + (v.montant || 0), 0) || 0;
        const total = facture.montant_ttc || 0;
        
        return {
          facture_id: facture.id,
          numero_facture: facture.numero_facture,
          date_iso: facture.date_facture,
          client_id: facture.client_id,
          client: facture.clients?.nom || 'Client non défini',
          total: total,
          paye: paye,
          restant: total - paye,
          statut_paiement: facture.statut_paiement,
          statut_livraison: facture.statut_livraison,
          articles: facture.lignes_facture_vente?.length || 0
        };
      }) || [];
      
      console.log('✅ Factures impayées transformées:', transformedData.length);
      return transformedData as FactureImpayee[];
    }
  });
};
