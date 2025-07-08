
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
      
      // Étape 1: Récupérer les factures impayées
      const { data: factures, error: facturesError } = await supabase
        .from('factures_vente')
        .select(`
          id,
          numero_facture,
          date_facture,
          client_id,
          montant_ttc,
          statut_paiement,
          statut_livraison,
          clients!inner(nom)
        `)
        .in('statut_paiement', ['en_attente', 'partiellement_payee'])
        .order('date_facture', { ascending: false });
      
      if (facturesError) {
        console.error('❌ Erreur requête factures:', facturesError);
        throw facturesError;
      }

      if (!factures || factures.length === 0) {
        console.log('✅ Aucune facture impayée trouvée');
        return [];
      }

      const factureIds = factures.map(f => f.id);

      // Étape 2: Récupérer les versements pour ces factures
      const { data: versements, error: versementsError } = await supabase
        .from('versements_clients')
        .select('facture_id, montant')
        .in('facture_id', factureIds);

      if (versementsError) {
        console.error('❌ Erreur requête versements:', versementsError);
        // Ne pas faire échouer la requête, continuer avec versements = []
      }

      // Étape 3: Récupérer le nombre d'articles par facture
      const { data: lignesFacture, error: lignesError } = await supabase
        .from('lignes_facture_vente')
        .select('facture_vente_id')
        .in('facture_vente_id', factureIds);

      if (lignesError) {
        console.error('❌ Erreur requête lignes facture:', lignesError);
        // Ne pas faire échouer la requête, continuer avec lignesFacture = []
      }

      // Étape 4: Combiner les données
      const transformedData = factures.map(facture => {
        // Calculer le montant payé
        const versementsFacture = versements?.filter(v => v.facture_id === facture.id) || [];
        const paye = versementsFacture.reduce((sum, v) => sum + (v.montant || 0), 0);
        
        // Calculer le nombre d'articles
        const articlesFacture = lignesFacture?.filter(l => l.facture_vente_id === facture.id) || [];
        const articles = articlesFacture.length;
        
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
          articles: articles
        };
      });
      
      console.log(`✅ Factures impayées transformées: ${transformedData.length} factures`);
      console.log('📊 Données sample:', transformedData.slice(0, 2));
      
      return transformedData as FactureImpayee[];
    }
  });
};
