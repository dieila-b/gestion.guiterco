
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { ArticleWithMargin } from '@/types/margins';

interface ArticleMarginTableProps {
  articles: ArticleWithMargin[];
  isLoading: boolean;
}

const ArticleMarginTable = ({ articles, isLoading }: ArticleMarginTableProps) => {
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
      {/* Bouton de debug */}
      <div className="flex justify-end">
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
                
                // Les frais des bons de commande sont maintenant dans une colonne séparée
                const fraisBonCommande = article.cout_total_unitaire - (article.prix_achat || 0) - fraisDirects;
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
                      <span className={fraisBonCommande > 0 ? 'text-purple-600 font-medium' : 'text-gray-500'}>
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
        </div>
      </div>
    </div>
  );
};

export default ArticleMarginTable;
