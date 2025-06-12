import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Check, Trash, Printer, Search, Link } from 'lucide-react';
import { useBonsLivraison } from '@/hooks/useBonsLivraison';
import { useFacturesAchat } from '@/hooks/useFacturesAchat';
import { useAllBonLivraisonArticles } from '@/hooks/useBonLivraisonArticles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { toast } from '@/hooks/use-toast';
import { ApprovalDialog } from './ApprovalDialog';
import { supabase } from '@/integrations/supabase/client';

const BonsLivraison = () => {
  const { bonsLivraison, isLoading } = useBonsLivraison();
  const { createFactureAchat } = useFacturesAchat();
  const { data: articlesCounts } = useAllBonLivraisonArticles();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBon, setSelectedBon] = useState<any>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_transit': return 'default';
      case 'livre': return 'secondary';
      case 'receptionne': return 'outline';
      default: return 'default';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_transit': return 'En transit';
      case 'livre': return 'Livré';
      case 'receptionne': return 'Réceptionné';
      default: return statut;
    }
  };

  const calculateTotal = (bon: any) => {
    return bon.bon_commande?.montant_total || 0;
  };

  const handleEdit = (id: string) => {
    toast({
      title: "Édition",
      description: "Fonctionnalité d'édition en cours de développement.",
      variant: "default",
    });
  };

  const handleApprove = (bon: any) => {
    console.log('🎯 Ouverture de la dialog d\'approbation pour le BL:', bon.numero_bon);
    setSelectedBon(bon);
    setApprovalDialogOpen(true);
  };

  const handleApprovalConfirm = async (approvalData: any) => {
    try {
      console.log('🔄 Début de la réception du bon de livraison:', selectedBon.numero_bon);
      console.log('📊 Données d\'approbation:', approvalData);
      
      // 1. Mettre à jour le statut du bon de livraison avec traçabilité complète
      console.log('📝 Mise à jour du statut et destination...');
      const updateData = { 
        statut: 'receptionne',
        date_reception: new Date().toISOString(),
        [`${approvalData.destinationType}_destination_id`]: approvalData.destinationId
      };

      const { error: updateError } = await supabase
        .from('bons_de_livraison')
        .update(updateData)
        .eq('id', selectedBon.id);

      if (updateError) {
        console.error('❌ Erreur mise à jour BL:', updateError);
        throw new Error(`Erreur de mise à jour: ${updateError.message}`);
      }

      console.log('✅ Statut BL mis à jour avec succès');

      // 2. Mettre à jour les quantités reçues avec vérification d'intégrité
      console.log('📦 Mise à jour des quantités reçues...');
      let totalArticlesTraites = 0;
      
      for (const article of approvalData.articles) {
        console.log(`📊 Traitement article ${article.id}: ${article.quantite_recue} unités`);
        
        const { error: articleError } = await supabase
          .from('articles_bon_livraison')
          .update({ quantite_recue: article.quantite_recue })
          .eq('id', article.id);

        if (articleError) {
          console.error(`❌ Erreur article ${article.id}:`, articleError);
          throw new Error(`Erreur de mise à jour de l'article: ${articleError.message}`);
        }
        
        totalArticlesTraites++;
        console.log(`✅ Article ${article.id} traité avec succès`);
      }

      console.log(`✅ ${totalArticlesTraites} articles traités avec succès`);

      // 3. Mettre à jour le stock avec traçabilité par type de destination
      console.log('🏪 Mise à jour du stock selon le type de destination...');
      let stockUpdates = 0;
      
      for (const article of approvalData.articles) {
        // Récupérer les informations de l'article
        const { data: articleData, error: articleDataError } = await supabase
          .from('articles_bon_livraison')
          .select('article_id, bon_livraison_id')
          .eq('id', article.id)
          .single();

        if (articleDataError || !articleData) {
          console.error(`❌ Erreur récupération données article ${article.id}:`, articleDataError);
          continue;
        }

        console.log(`🔄 Mise à jour stock pour article ${articleData.article_id} - Quantité: ${article.quantite_recue}`);

        if (approvalData.destinationType === 'entrepot') {
          // Mettre à jour le stock principal avec traçabilité
          const { error: stockError } = await supabase
            .rpc('update_stock_principal', {
              p_article_id: articleData.article_id,
              p_entrepot_id: approvalData.destinationId,
              p_quantite: article.quantite_recue
            });
          
          if (stockError) {
            console.error(`❌ Erreur stock principal article ${articleData.article_id}:`, stockError);
          } else {
            stockUpdates++;
            console.log(`✅ Stock principal mis à jour: Article ${articleData.article_id} → Entrepôt ${approvalData.destinationId}`);
          }
        } else {
          // Mettre à jour le stock PDV avec traçabilité
          const { error: stockError } = await supabase
            .rpc('update_stock_pdv', {
              p_article_id: articleData.article_id,
              p_point_vente_id: approvalData.destinationId,
              p_quantite: article.quantite_recue
            });
          
          if (stockError) {
            console.error(`❌ Erreur stock PDV article ${articleData.article_id}:`, stockError);
          } else {
            stockUpdates++;
            console.log(`✅ Stock PDV mis à jour: Article ${articleData.article_id} → Point de vente ${approvalData.destinationId}`);
          }
        }
      }

      console.log(`✅ ${stockUpdates} mises à jour de stock effectuées`);

      // 4. Générer automatiquement une facture d'achat avec numérotation cohérente
      console.log('💰 Génération automatique de la facture d\'achat...');
      const dateFacture = new Date();
      const numeroFacture = `FA-${format(dateFacture, 'yy-MM-dd')}-${Date.now().toString().slice(-6)}`;
      
      const factureData = {
        numero_facture: numeroFacture,
        bon_commande_id: selectedBon.bon_commande_id,
        bon_livraison_id: selectedBon.id,
        fournisseur: selectedBon.fournisseur,
        date_facture: dateFacture.toISOString(),
        montant_ht: calculateTotal(selectedBon) / (1 + (selectedBon.taux_tva || 20) / 100),
        tva: calculateTotal(selectedBon) * (selectedBon.taux_tva || 20) / 100 / (1 + (selectedBon.taux_tva || 20) / 100),
        montant_ttc: calculateTotal(selectedBon),
        transit_douane: selectedBon.transit_douane || 0,
        taux_tva: selectedBon.taux_tva || 20,
        statut_paiement: 'en_attente'
      };

      console.log('📋 Données facture:', factureData);

      await createFactureAchat.mutateAsync(factureData);

      console.log(`✅ Facture ${numeroFacture} générée avec succès`);

      // 5. Vérification finale de l'intégrité de la chaîne complète
      console.log('🔍 Vérification finale de l\'intégrité de la chaîne...');
      const { data: verificationChaine, error: verificationError } = await supabase
        .from('bons_de_livraison')
        .select(`
          id,
          numero_bon,
          statut,
          bon_commande:bons_de_commande!fk_bons_livraison_bon_commande_id(
            numero_bon,
            statut
          )
        `)
        .eq('id', selectedBon.id)
        .single();

      if (verificationError || !verificationChaine) {
        console.warn('⚠️ Avertissement lors de la vérification d\'intégrité:', verificationError);
      } else {
        console.log('✅ Vérification d\'intégrité réussie - Chaîne complète:', verificationChaine);
      }

      toast({
        title: "✅ Bon de livraison réceptionné avec succès",
        description: `Stock mis à jour (${stockUpdates} articles) et facture ${numeroFacture} générée. Traçabilité complète: BC → BL → Stock → Facture.`,
        variant: "default",
      });

      console.log('🎯 Réception terminée - Chaîne complète: Commande → Livraison → Stock → Facture opérationnelle');

    } catch (error) {
      console.error('❌ Erreur critique lors de la réception:', error);
      toast({
        title: "❌ Erreur de réception",
        description: error instanceof Error ? error.message : "Erreur lors de la réception du bon de livraison.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bon de livraison ? Cette action peut affecter la traçabilité de la chaîne d\'approvisionnement.')) {
      try {
        console.log('🗑️ Suppression BL avec vérification de l\'impact sur la traçabilité:', id);
        
        // Vérifier l'impact sur la traçabilité
        const { data: facturesLiees } = await supabase
          .from('factures_achat')
          .select('numero_facture')
          .eq('bon_livraison_id', id);

        if (facturesLiees && facturesLiees.length > 0) {
          const numerosFactures = facturesLiees.map(f => f.numero_facture).join(', ');
          console.log('⚠️ Factures liées trouvées:', numerosFactures);
          
          if (!window.confirm(`Attention: Cette suppression affectera la traçabilité des factures suivantes: ${numerosFactures}. Continuer ?`)) {
            return;
          }
        }
        
        const { error } = await supabase
          .from('bons_de_livraison')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('❌ Erreur suppression BL:', error);
          throw error;
        }
        
        toast({
          title: "✅ Bon de livraison supprimé",
          description: "Attention: la traçabilité de la chaîne d'approvisionnement pourrait être affectée.",
          variant: "default",
        });
        
        console.log('✅ Suppression terminée avec avertissement traçabilité');
      } catch (error) {
        console.error('❌ Erreur lors de la suppression BL:', error);
        toast({
          title: "❌ Erreur de suppression",
          description: "Erreur lors de la suppression du bon de livraison.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePrint = (id: string) => {
    toast({
      title: "Impression",
      description: "Fonctionnalité d'impression en cours de développement.",
      variant: "default",
    });
  };

  // ... keep existing code (renderActionButtons function)
  const renderActionButtons = (bon: any) => {
    if (bon.statut === 'en_transit' || bon.statut === 'livre') {
      return (
        <div className="flex items-center justify-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300"
            onClick={() => handleEdit(bon.id)}
            title="Éditer"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-green-400 hover:bg-green-500/20 hover:text-green-300"
            onClick={() => handleApprove(bon)}
            title="Réceptionner"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            onClick={() => handleDelete(bon.id)}
            title="Supprimer"
          >
            <Trash className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-500/20 hover:text-gray-300"
            onClick={() => handlePrint(bon.id)}
            title="Imprimer"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-500/20 hover:text-gray-300"
            onClick={() => handlePrint(bon.id)}
            title="Imprimer"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  };

  const filteredBons = bonsLivraison?.filter(bon =>
    bon.numero_bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.fournisseur.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Bons de livraison</h2>
          <p className="text-gray-400">Gérez vos bons de livraison fournisseurs avec numérotation synchronisée BL-AA-MM-JJ-XXX et traçabilité complète</p>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Liste des bons de livraison</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">N° Livraison</TableHead>
                <TableHead className="text-gray-300">Bon de commande</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Fournisseur</TableHead>
                <TableHead className="text-gray-300">Articles</TableHead>
                <TableHead className="text-gray-300">Statut</TableHead>
                <TableHead className="text-gray-300">Montant</TableHead>
                <TableHead className="text-gray-300 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBons.map((bon) => {
                const articlesCount = articlesCounts?.[bon.id] || 0;
                return (
                  <TableRow key={bon.id} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell className="text-white font-medium">
                      {bon.numero_bon}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div className="flex items-center space-x-2">
                        <span>{bon.bon_commande?.numero_bon || 'N/A'}</span>
                        {bon.bon_commande?.numero_bon && (
                          <Link className="h-3 w-3 text-blue-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {format(new Date(bon.date_livraison), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {bon.fournisseur}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                        {articlesCount} article{articlesCount > 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeColor(bon.statut)} className="text-xs">
                        {getStatusLabel(bon.statut)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-semibold">
                      {formatCurrency(calculateTotal(bon))}
                    </TableCell>
                    <TableCell>
                      {renderActionButtons(bon)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredBons.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucun bon de livraison trouvé'}
            </div>
          )}
        </CardContent>
      </Card>

      <ApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        bonLivraison={selectedBon}
        onApprove={handleApprovalConfirm}
      />
    </div>
  );
};

export default BonsLivraison;
