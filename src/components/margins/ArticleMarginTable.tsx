
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bug, RefreshCw, Database } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { ArticleWithMargin } from '@/types/margins';

interface ArticleMarginTableProps {
  articles: ArticleWithMargin[];
  isLoading: boolean;
}

const ArticleMarginTable = ({ articles, isLoading }: ArticleMarginTableProps) => {
  const queryClient = useQueryClient();

  const getMarginBadgeColor = (taux: number) => {
    if (taux >= 30) return 'bg-green-100 text-green-800';
    if (taux >= 20) return 'bg-blue-100 text-blue-800';
    if (taux >= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleDebugFrais = async () => {
    try {
      console.log('🔍 Lancement du debug des frais détaillé...');
      
      const { data, error } = await supabase.rpc('debug_frais_articles_detaille');
      
      if (error) {
        console.error('❌ Erreur lors du debug des frais:', error);
        toast({
          title: "Erreur de debug",
          description: "Impossible de récupérer les données de debug",
          variant: "destructive",
        });
        return;
      }

      console.log('📊 Données de debug des frais détaillées:', data);
      
      // Afficher les données dans la console avec un format lisible
      if (data && data.length > 0) {
        console.table(data);
        
        // Statistiques utiles
        const totalArticles = new Set(data.map(d => d.article_id)).size;
        const articlesAvecFrais = data.filter(d => d.frais_total_bc > 0).length;
        const fraisTotalCalcule = data.reduce((sum, d) => sum + (d.part_frais || 0), 0);
        
        console.log(`📈 Statistiques:`);
        console.log(`- Articles uniques: ${totalArticles}`);
        console.log(`- Lignes avec frais BC > 0: ${articlesAvecFrais}`);
        console.log(`- Total frais répartis: ${fraisTotalCalcule} GNF`);
        
        toast({
          title: "Debug des frais réussi",
          description: `${data.length} enregistrements analysés. ${articlesAvecFrais} avec frais BC. Consultez la console pour les détails.`,
        });
      } else {
        console.log('⚠️ Aucune donnée de frais trouvée');
        toast({
          title: "Aucune donnée trouvée",
          description: "Aucune donnée de frais trouvée. Vérifiez que des bons de commande approuvés existent avec des frais.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du debug:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du debug",
        variant: "destructive",
      });
    }
  };

  const handleRefreshData = async () => {
    try {
      console.log('🔄 Rafraîchissement des données de marges...');
      
      // Invalider le cache des marges pour forcer le rechargement
      await queryClient.invalidateQueries({ queryKey: ['articles-with-margins'] });
      
      toast({
        title: "Données rafraîchies",
        description: "Les données de marges ont été rechargées depuis la base de données.",
      });
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
      toast({
        title: "Erreur de rafraîchissement",
        description: "Impossible de rafraîchir les données",
        variant: "destructive",
      });
    }
  };

  const handleForceRefreshView = async () => {
    try {
      console.log('🔄 Forçage du recalcul de la vue marges...');
      
      // Appeler la nouvelle fonction de rafraîchissement
      const { error } = await supabase.rpc('refresh_marges_view');
      
      if (error) {
        console.error('❌ Erreur lors du recalcul de la vue:', error);
        toast({
          title: "Erreur de recalcul",
          description: "Impossible de forcer le recalcul de la vue",
          variant: "destructive",
        });
        return;
      }

      // Invalider le cache après le recalcul
      await queryClient.invalidateQueries({ queryKey: ['articles-with-margins'] });
      
      toast({
        title: "Vue recalculée",
        description: "La vue des marges a été forcée à se recalculer. Les données sont maintenant à jour.",
      });
    } catch (error) {
      console.error('❌ Erreur lors du recalcul forcé:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du recalcul forcé",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          Chargement des marges...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Boutons de debug et rafraîchissement */}
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Rafraîchir
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleForceRefreshView}
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          Recalculer Vue
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDebugFrais}
          className="flex items-center gap-2"
        >
          <Bug className="h-4 w-4" />
          Debug Frais BC
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Référence</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="text-right">Prix Achat</TableHead>
              <TableHead className="text-right">Frais Direct</TableHead>
              <TableHead className="text-right">Frais BC*</TableHead>
              <TableHead className="text-right">Frais Total</TableHead>
              <TableHead className="text-right">Coût Total</TableHead>
              <TableHead className="text-right">Prix Vente</TableHead>
              <TableHead className="text-right">Marge Unit.</TableHead>
              <TableHead className="text-center">Taux Marge</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles?.length > 0 ? (
              articles.map((article) => {
                // Calculer les frais directs (saisis directement sur l'article)
                const fraisDirects = (article.frais_logistique || 0) + 
                                   (article.frais_douane || 0) + 
                                   (article.frais_transport || 0) + 
                                   (article.autres_frais || 0);
                
                // Utiliser directement le champ frais_bon_commande de la vue
                const fraisBonCommande = article.frais_bon_commande || 0;
                console.log(`📊 Article ${article.nom}: frais_bon_commande = ${fraisBonCommande} GNF`);
                
                const fraisTotal = fraisDirects + fraisBonCommande;

                return (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.reference}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={article.nom}>
                      {article.nom}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(article.prix_achat || 0)}</TableCell>
                    <TableCell className="text-right">
                      <span className={fraisDirects > 0 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                        {formatCurrency(fraisDirects)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={fraisBonCommande > 0 ? 'text-purple-600 font-bold' : 'text-gray-500'}>
                        {formatCurrency(fraisBonCommande)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={fraisTotal > 0 ? 'text-orange-600 font-bold' : 'text-gray-500'}>
                        {formatCurrency(fraisTotal)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(article.cout_total_unitaire)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(article.prix_vente || 0)}</TableCell>
                    <TableCell className="text-right">
                      <span className={article.marge_unitaire >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(article.marge_unitaire)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getMarginBadgeColor(article.taux_marge)}>
                        {article.taux_marge.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="text-muted-foreground">
                    Aucun article avec marge trouvé
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Légende mise à jour */}
        <div className="p-4 bg-muted/20 border-t text-sm text-muted-foreground">
          <p><strong>Frais BC*</strong> = Frais issus des Bons de Commande (répartis proportionnellement par montant de ligne)</p>
          <p><strong>Frais Total</strong> = Frais Direct + Frais BC</p>
          <p>Utilisez le bouton "Debug Frais BC" pour analyser les calculs en détail dans la console.</p>
          <p>Le bouton "Rafraîchir" recharge les données depuis le cache.</p>
          <p>Le bouton "Recalculer Vue" force le recalcul complet de la vue des marges.</p>
        </div>
      </div>
    </div>
  );
};

export default ArticleMarginTable;
