
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

// Hook pour les factures de vente utilisant la fonction SQL optimisée
export const useFacturesVenteQuery = () => {
  return useQuery<FactureVente[], Error>({
    queryKey: ['factures_vente'],
    queryFn: async () => {
      console.log('🔍 Fetching factures vente using database function...');
      
      const { data: functionResult, error: functionError } = await supabase
        .rpc('get_factures_vente_with_details');
      
      if (functionError) {
        console.error('❌ Error calling get_factures_vente_with_details function:', functionError);
        throw functionError;
      }
      
      console.log('📊 Raw function result:', functionResult);
      
      // La fonction retourne un JSONB, donc les données sont dans functionResult directement
      const facturesData = functionResult || [];
      
      if (!Array.isArray(facturesData)) {
        console.error('❌ Function did not return an array:', facturesData);
        return [];
      }
      
      // Log détaillé pour débugger les données de chaque facture
      facturesData.forEach((facture: any, index: number) => {
        console.log(`🧾 Facture ${index + 1} - ${facture.numero_facture}:`, {
          id: facture.id,
          nb_articles: facture.nb_articles,
          lignes_facture: facture.lignes_facture,
          lignes_facture_length: facture.lignes_facture?.length,
          versements: facture.versements,
          versements_length: facture.versements?.length,
          statut_livraison_db: facture.statut_livraison,
          statut_paiement_db: facture.statut_paiement,
          montant_ttc: facture.montant_ttc,
          client_nom: facture.client?.nom
        });
        
        // Log des versements détaillés
        if (facture.versements && Array.isArray(facture.versements)) {
          const totalVersements = facture.versements.reduce((sum: number, v: any) => sum + (v.montant || 0), 0);
          console.log(`💰 Versements pour ${facture.numero_facture}:`, {
            nombre_versements: facture.versements.length,
            total_verse: totalVersements,
            montant_facture: facture.montant_ttc,
            versements_detail: facture.versements
          });
        }
        
        // Log des lignes de facture détaillées
        if (facture.lignes_facture && Array.isArray(facture.lignes_facture)) {
          console.log(`📦 Lignes pour ${facture.numero_facture}:`, {
            nombre_lignes: facture.lignes_facture.length,
            lignes_detail: facture.lignes_facture.map((ligne: any) => ({
              id: ligne.id,
              article_nom: ligne.article?.nom,
              quantite: ligne.quantite,
              statut_livraison: ligne.statut_livraison
            }))
          });
        }
      });
      
      console.log('✅ Processed factures vente from function:', facturesData.length, 'factures');
      return facturesData as unknown as FactureVente[];
    },
    staleTime: 5000, // Réduit pour debug
    refetchOnWindowFocus: true,
    refetchInterval: 30000 // Plus fréquent pour debug
  });
};
