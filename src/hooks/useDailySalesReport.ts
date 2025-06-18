
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { Client } from '@/types/sales';

export interface DailySalesData {
  totalVentes: number;
  montantEncaisse: number;
  resteAPayer: number;
  ventesParProduit: Array<{
    produit: string;
    quantiteVendue: number;
    montantVentes: number;
  }>;
  ventesParClient: Array<{
    client: string;
    montantTotal: number;
    montantPaye: number;
    resteAPayer: number;
    etat: 'payé' | 'partiel' | 'impayé';
  }>;
}

export const useDailySalesReport = (selectedDate: Date) => {
  return useQuery({
    queryKey: ['daily-sales-report', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async (): Promise<DailySalesData> => {
      console.log('Fetching daily sales report for:', format(selectedDate, 'yyyy-MM-dd'));
      
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const startOfDay = `${dateStr} 00:00:00`;
      const endOfDay = `${dateStr} 23:59:59`;

      // 1. Total des ventes : toutes les factures émises à cette date
      const { data: facturesJour, error: facturesError } = await supabase
        .from('factures_vente')
        .select(`
          *,
          client:clients(nom, prenom),
          lignes_facture:lignes_facture_vente(
            *,
            article:catalogue(nom)
          )
        `)
        .gte('date_facture', startOfDay)
        .lte('date_facture', endOfDay);

      if (facturesError) {
        console.error('Error fetching factures:', facturesError);
        throw facturesError;
      }

      console.log(`📊 ${facturesJour?.length || 0} factures trouvées pour le ${dateStr}`);

      // 2. Montant encaissé : tous les versements réellement encaissés à cette date
      const { data: versementsJour, error: versementsError } = await supabase
        .from('versements_clients')
        .select(`
          *,
          client:clients(nom, prenom)
        `)
        .gte('date_versement', startOfDay)
        .lte('date_versement', endOfDay);

      if (versementsError) {
        console.error('Error fetching versements:', versementsError);
        throw versementsError;
      }

      console.log(`💰 ${versementsJour?.length || 0} versements trouvés pour le ${dateStr}`);

      // 3. Récupérer tous les versements pour les factures du jour (pour calculer les restes)
      const factureIds = facturesJour?.map(f => f.id) || [];
      let versementsFactures: any[] = [];
      
      if (factureIds.length > 0) {
        const { data: versements, error: versementsFacturesError } = await supabase
          .from('versements_clients')
          .select('*')
          .in('facture_id', factureIds);
        
        if (versementsFacturesError) {
          console.error('Error fetching versements for factures:', versementsFacturesError);
          throw versementsFacturesError;
        }
        
        versementsFactures = versements || [];
      }

      // Calculs des totaux
      const totalVentes = facturesJour?.reduce((sum, facture) => sum + (facture.montant_ttc || 0), 0) || 0;
      const montantEncaisse = versementsJour?.reduce((sum, versement) => sum + (versement.montant || 0), 0) || 0;

      // Calcul du reste à payer pour les factures du jour
      let resteAPayer = 0;
      const clientsMap = new Map();

      facturesJour?.forEach(facture => {
        // Calculer les versements pour cette facture spécifique
        const versementsFacture = versementsFactures.filter(v => v.facture_id === facture.id);
        const montantPayeFacture = versementsFacture.reduce((sum, v) => sum + (v.montant || 0), 0);
        const resteFacture = Math.max(0, (facture.montant_ttc || 0) - montantPayeFacture);
        
        resteAPayer += resteFacture;

        // Préparer les données par client
        const clientNom = facture.client?.nom || `${facture.client?.prenom || ''} ${facture.client?.nom || ''}`.trim() || 'Client inconnu';
        const clientId = facture.client_id;
        
        if (clientsMap.has(clientId)) {
          const existing = clientsMap.get(clientId);
          existing.montantTotal += facture.montant_ttc || 0;
          existing.montantPaye += montantPayeFacture;
          existing.resteAPayer += resteFacture;
        } else {
          clientsMap.set(clientId, {
            client: clientNom,
            montantTotal: facture.montant_ttc || 0,
            montantPaye: montantPayeFacture,
            resteAPayer: resteFacture,
            etat: 'impayé' as const
          });
        }
      });

      // Définir les états des clients
      clientsMap.forEach(client => {
        if (client.montantPaye >= client.montantTotal) {
          client.etat = 'payé';
        } else if (client.montantPaye > 0) {
          client.etat = 'partiel';
        } else {
          client.etat = 'impayé';
        }
      });

      // Calcul des ventes par produit (basé sur les factures du jour)
      const produitsMap = new Map();
      facturesJour?.forEach(facture => {
        facture.lignes_facture?.forEach((ligne: any) => {
          const nomProduit = ligne.article?.nom || 'Produit inconnu';
          if (produitsMap.has(nomProduit)) {
            const existing = produitsMap.get(nomProduit);
            existing.quantiteVendue += ligne.quantite || 0;
            existing.montantVentes += ligne.montant_ligne || 0;
          } else {
            produitsMap.set(nomProduit, {
              produit: nomProduit,
              quantiteVendue: ligne.quantite || 0,
              montantVentes: ligne.montant_ligne || 0
            });
          }
        });
      });

      const ventesParProduit = Array.from(produitsMap.values());
      const ventesParClient = Array.from(clientsMap.values());

      console.log('Daily sales report calculated:', {
        totalVentes,
        montantEncaisse,
        resteAPayer,
        ventesParProduit: ventesParProduit.length,
        ventesParClient: ventesParClient.length
      });

      return {
        totalVentes,
        montantEncaisse,
        resteAPayer,
        ventesParProduit,
        ventesParClient
      };
    },
    refetchInterval: 30000, // Actualisation toutes les 30 secondes
  });
};
