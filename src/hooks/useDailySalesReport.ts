
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

      // 1. Récupérer toutes les commandes du jour avec leurs lignes et clients
      const { data: commandes, error: commandesError } = await supabase
        .from('commandes_clients')
        .select(`
          *,
          client:clients(*),
          lignes_commande(
            *,
            article:catalogue(nom)
          )
        `)
        .gte('date_commande', startOfDay)
        .lte('date_commande', endOfDay)
        .eq('statut', 'confirmee');

      if (commandesError) {
        console.error('Error fetching commandes:', commandesError);
        throw commandesError;
      }

      // 2. Récupérer tous les versements du jour
      const { data: versements, error: versementsError } = await supabase
        .from('versements_clients')
        .select(`
          *,
          client:clients(*)
        `)
        .gte('date_versement', startOfDay)
        .lte('date_versement', endOfDay);

      if (versementsError) {
        console.error('Error fetching versements:', versementsError);
        throw versementsError;
      }

      // Calculs des totaux
      const totalVentes = commandes?.reduce((sum, cmd) => sum + cmd.montant_ttc, 0) || 0;
      const montantEncaisse = versements?.reduce((sum, v) => sum + v.montant, 0) || 0;
      const resteAPayer = totalVentes - montantEncaisse;

      // Calcul des ventes par produit
      const produitsMap = new Map();
      commandes?.forEach(commande => {
        commande.lignes_commande?.forEach((ligne: any) => {
          const nomProduit = ligne.article?.nom || 'Produit inconnu';
          if (produitsMap.has(nomProduit)) {
            const existing = produitsMap.get(nomProduit);
            existing.quantiteVendue += ligne.quantite;
            existing.montantVentes += ligne.montant_ligne;
          } else {
            produitsMap.set(nomProduit, {
              produit: nomProduit,
              quantiteVendue: ligne.quantite,
              montantVentes: ligne.montant_ligne
            });
          }
        });
      });

      const ventesParProduit = Array.from(produitsMap.values());

      // Calcul des ventes par client
      const clientsMap = new Map();
      commandes?.forEach(commande => {
        const clientNom = commande.client?.nom || 'Client inconnu';
        if (clientsMap.has(commande.client_id)) {
          const existing = clientsMap.get(commande.client_id);
          existing.montantTotal += commande.montant_ttc;
        } else {
          clientsMap.set(commande.client_id, {
            client: clientNom,
            montantTotal: commande.montant_ttc,
            montantPaye: 0,
            resteAPayer: 0,
            etat: 'impayé' as const
          });
        }
      });

      // Ajouter les paiements
      versements?.forEach(versement => {
        if (clientsMap.has(versement.client_id)) {
          const client = clientsMap.get(versement.client_id);
          client.montantPaye += versement.montant;
        }
      });

      // Calculer les restes à payer et les états
      clientsMap.forEach(client => {
        client.resteAPayer = client.montantTotal - client.montantPaye;
        if (client.montantPaye >= client.montantTotal) {
          client.etat = 'payé';
        } else if (client.montantPaye > 0) {
          client.etat = 'partiel';
        } else {
          client.etat = 'impayé';
        }
      });

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
