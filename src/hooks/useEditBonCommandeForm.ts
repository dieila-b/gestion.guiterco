import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFournisseurs } from '@/hooks/useFournisseurs';
import { useCatalogue } from '@/hooks/useCatalogue';
import { useBonsCommande } from '@/hooks/useBonsCommande';
import { useBonCommandeArticles } from '@/hooks/useBonCommandeArticles';
import { toast } from '@/hooks/use-toast';
import { 
  bonCommandeSchema, 
  type BonCommandeForm, 
  type ArticleLigne 
} from './useBonCommandeForm/types';
import {
  calculateSousTotal,
  calculateMontantHT,
  calculateTVA,
  calculateMontantTTC,
  calculateResteAPayer
} from './useBonCommandeForm/calculations';
import {
  createArticleLigne,
  updateQuantite,
  updatePrix,
  removeArticle
} from './useBonCommandeForm/articleOperations';
import { calculatePaymentStatus } from './useBonCommandeForm/paymentStatus';

export const useEditBonCommandeForm = (bon: any, onSuccess: () => void) => {
  const { fournisseurs, isLoading: loadingFournisseurs, refetch: refetchFournisseurs } = useFournisseurs();
  const { articles, isLoading: loadingArticles } = useCatalogue();
  const { updateBonCommande } = useBonsCommande();
  const { data: existingArticles } = useBonCommandeArticles(bon.id);
  
  const [articlesLignes, setArticlesLignes] = useState<ArticleLigne[]>([]);
  const [montantPaye, setMontantPaye] = useState(bon.montant_paye || 0);
  const [refreshingFournisseurs, setRefreshingFournisseurs] = useState(false);

  const form = useForm<BonCommandeForm>({
    resolver: zodResolver(bonCommandeSchema),
    defaultValues: {
      fournisseur_id: bon.fournisseur_id || '',
      date_commande: bon.date_commande?.split('T')[0] || new Date().toISOString().split('T')[0],
      date_livraison_prevue: bon.date_livraison_prevue?.split('T')[0] || '',
      statut: bon.statut || 'en_cours',
      statut_paiement: bon.statut_paiement || 'en_attente',
      remise: bon.remise || 0,
      frais_livraison: bon.frais_livraison || 0,
      frais_logistique: bon.frais_logistique || 0,
      transit_douane: bon.transit_douane || 0,
      taux_tva: bon.taux_tva || 0, // Changed from 20 to 0
      observations: bon.observations || '',
    },
  });

  // Charger les articles existants
  useEffect(() => {
    if (existingArticles && existingArticles.length > 0) {
      const articlesFormatted: ArticleLigne[] = existingArticles.map(item => ({
        article_id: item.article_id,
        nom: item.catalogue?.nom || 'Article inconnu',
        quantite: item.quantite,
        prix_unitaire: Number(item.prix_unitaire),
        montant_ligne: Number(item.montant_ligne)
      }));
      setArticlesLignes(articlesFormatted);
    }
  }, [existingArticles]);

  const handleRefreshFournisseurs = async () => {
    setRefreshingFournisseurs(true);
    try {
      await refetchFournisseurs();
      toast({
        title: "Liste actualisée",
        description: "La liste des fournisseurs a été mise à jour.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error refreshing fournisseurs:', error);
    } finally {
      setRefreshingFournisseurs(false);
    }
  };

  const ajouterArticle = (article: { id: string; nom: string; prix_achat?: number }) => {
    const nouvelleArticle = createArticleLigne(article);
    setArticlesLignes([...articlesLignes, nouvelleArticle]);
  };

  const modifierQuantite = (index: number, quantite: number) => {
    setArticlesLignes(updateQuantite(articlesLignes, index, quantite));
  };

  const modifierPrix = (index: number, prix: number) => {
    setArticlesLignes(updatePrix(articlesLignes, index, prix));
  };

  const supprimerArticle = (index: number) => {
    setArticlesLignes(removeArticle(articlesLignes, index));
  };

  // Calculs avec arrondissements - TVA par défaut à 0
  const sousTotal = calculateSousTotal(articlesLignes);
  const remise = Math.round(form.watch('remise') || 0);
  const fraisLivraison = Math.round(form.watch('frais_livraison') || 0);
  const fraisLogistique = Math.round(form.watch('frais_logistique') || 0);
  const transitDouane = Math.round(form.watch('transit_douane') || 0);
  const surstaries = Math.round(form.watch('surstaries') || 0);
  const tauxTva = form.watch('taux_tva') || 0; // Changed from 20 to 0
  const montantHT = calculateMontantHT(sousTotal, remise, fraisLivraison, fraisLogistique, transitDouane, surstaries);
  const tva = calculateTVA(montantHT, tauxTva);
  const montantTTC = calculateMontantTTC(montantHT, tva);
  const resteAPayer = calculateResteAPayer(montantTTC, montantPaye);

  // Logique automatique pour le statut de paiement
  useEffect(() => {
    const newStatus = calculatePaymentStatus(montantPaye, montantTTC);
    form.setValue('statut_paiement', newStatus);
  }, [montantPaye, montantTTC, form]);

  const onSubmit = async (data: BonCommandeForm) => {
    console.log('🎯 Début de la mise à jour du bon de commande');

    if (articlesLignes.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un article",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔄 Mise à jour du bon de commande:', bon.id);
      
      await updateBonCommande.mutateAsync({
        id: bon.id,
        fournisseur_id: data.fournisseur_id,
        date_commande: data.date_commande,
        date_livraison_prevue: data.date_livraison_prevue,
        statut: data.statut,
        statut_paiement: data.statut_paiement,
        remise: Number(data.remise),
        frais_livraison: Number(data.frais_livraison),
        frais_logistique: Number(data.frais_logistique),
        transit_douane: Number(data.transit_douane),
        taux_tva: Number(data.taux_tva),
        observations: data.observations,
        montant_ht: Number(montantHT),
        tva: Number(tva),
        montant_total: Number(montantTTC),
        montant_paye: Number(montantPaye),
      });
      
      console.log('✅ Bon de commande mis à jour avec succès');
      onSuccess();
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du bon de commande:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour du bon de commande",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    fournisseurs,
    articles,
    loadingFournisseurs,
    loadingArticles,
    refreshingFournisseurs,
    articlesLignes,
    montantPaye,
    sousTotal,
    remise,
    fraisLivraison,
    fraisLogistique,
    transitDouane,
    tauxTva,
    montantHT,
    tva,
    montantTTC,
    resteAPayer,
    updateBonCommande,
    setMontantPaye,
    handleRefreshFournisseurs,
    ajouterArticle,
    modifierQuantite,
    modifierPrix,
    supprimerArticle,
    onSubmit
  };
};
