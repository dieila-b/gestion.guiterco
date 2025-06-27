
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PrecommandeAlert {
  article_id: string;
  article_nom: string;
  total_en_attente: number;
  nb_precommandes: number;
}

interface BonLivraisonArticle {
  article_id: string;
  quantite_recue: number;
}

export const useBonLivraisonPrecommandesCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [alertsData, setAlertsData] = useState<PrecommandeAlert[]>([]);
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);

  const checkPrecommandesForArticles = async (articles: BonLivraisonArticle[]) => {
    console.log('🔄 Vérification des précommandes pour les articles:', articles);
    setIsChecking(true);
    
    try {
      const alerts: PrecommandeAlert[] = [];
      
      for (const article of articles) {
        if (article.quantite_recue > 0) {
          // Vérifier les précommandes en attente pour cet article
          const { data: precommandesData, error } = await supabase
            .from('lignes_precommande')
            .select(`
              precommande_id,
              quantite,
              quantite_livree,
              precommandes!inner (
                statut,
                numero_precommande
              ),
              catalogue!inner (
                id,
                nom
              )
            `)
            .eq('article_id', article.article_id)
            .in('precommandes.statut', ['confirmee', 'en_preparation', 'partiellement_livree']);

          if (error) {
            console.error('❌ Erreur lors de la vérification des précommandes:', error);
            continue;
          }

          if (precommandesData && precommandesData.length > 0) {
            // Calculer les quantités totales en attente
            const totalEnAttente = precommandesData.reduce((sum, ligne) => {
              const quantiteRestante = ligne.quantite - (ligne.quantite_livree || 0);
              return sum + Math.max(0, quantiteRestante);
            }, 0);

            if (totalEnAttente > 0) {
              alerts.push({
                article_id: article.article_id,
                article_nom: precommandesData[0].catalogue.nom,
                total_en_attente: totalEnAttente,
                nb_precommandes: new Set(precommandesData.map(p => p.precommande_id)).size
              });
            }
          }
        }
      }

      setAlertsData(alerts);
      
      if (alerts.length > 0) {
        console.log('🔔 Précommandes en attente détectées:', alerts);
        setShowAlertsDialog(true);
        
        // Afficher également les notifications toast
        alerts.forEach(alert => {
          toast({
            title: "🔔 Précommandes en attente détectées",
            description: `Article "${alert.article_nom}" - ${alert.total_en_attente} unités demandées dans ${alert.nb_precommandes} précommande(s)`,
            variant: "default",
          });
        });
      } else {
        console.log('✅ Aucune précommande en attente trouvée');
        toast({
          title: "✅ Aucune précommande en attente",
          description: "Aucune précommande en attente pour les articles livrés.",
          variant: "default",
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des précommandes:', error);
      toast({
        title: "❌ Erreur de vérification",
        description: "Impossible de vérifier les précommandes en attente.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const closeAlertsDialog = () => {
    setShowAlertsDialog(false);
    setAlertsData([]);
  };

  return {
    isChecking,
    alertsData,
    showAlertsDialog,
    checkPrecommandesForArticles,
    closeAlertsDialog
  };
};
