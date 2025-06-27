import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFournisseurs } from '@/hooks/useFournisseurs';
import { useCatalogue } from '@/hooks/useCatalogue';
import { useBonsCommande } from '@/hooks/useBonsCommande';
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

export const useBonCommandeForm = (onSuccess: () => void) => {
  const { fournisseurs, isLoading: loadingFournisseurs, refetch: refetchFournisseurs } = useFournisseurs();
  const { articles, isLoading: loadingArticles } = useCatalogue();
  const { createBonCommande } = useBonsCommande();
  
  const [articlesLignes, setArticlesLignes] = useState<ArticleLigne[]>([]);
  const [montantPaye, setMontantPaye] = useState(0);
  const [refreshingFournisseurs, setRefreshingFournisseurs] = useState(false);

  const form = useForm<BonCommandeForm>({
    resolver: zodResolver(bonCommandeSchema),
    defaultValues: {
      date_commande: new Date().toISOString().split('T')[0],
      statut: 'en_cours',
      statut_paiement: 'en_attente',
      remise: 0,
      frais_livraison: 0,
      frais_logistique: 0,
      transit_douane: 0,
      taux_tva: 0, // Changed from 20 to 0
    },
  });

  useEffect(() => {
    console.log('Component mounted, refreshing fournisseurs...');
    refetchFournisseurs();
  }, [refetchFournisseurs]);

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
  const tauxTva = form.watch('taux_tva') || 0; // Changed from 20 to 0
  const montantHT = calculateMontantHT(sousTotal, remise, fraisLivraison, fraisLogistique, transitDouane);
  const tva = calculateTVA(montantHT, tauxTva);
  const montantTTC = calculateMontantTTC(montantHT, tva);
  const resteAPayer = calculateResteAPayer(montantTTC, montantPaye);

  // Logique automatique pour le statut de paiement
  useEffect(() => {
    const newStatus = calculatePaymentStatus(montantPaye, montantTTC);
    form.setValue('statut_paiement', newStatus);
  }, [montantPaye, montantTTC, form]);

  const onSubmit = async (data: BonCommandeForm) => {
    console.log('🎯 Début de la soumission du formulaire');
    console.log('📋 Données du formulaire:', data);
    console.log('📦 Articles sélectionnés:', articlesLignes);

    if (articlesLignes.length === 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez ajouter au moins un article au bon de commande",
        variant: "destructive",
      });
      return;
    }

    if (!data.fournisseur_id) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner un fournisseur",
        variant: "destructive",
      });
      return;
    }

    const fournisseur = fournisseurs?.find(f => f.id === data.fournisseur_id);
    if (!fournisseur) {
      toast({
        title: "Erreur de validation",
        description: "Fournisseur non trouvé dans la liste",
        variant: "destructive",
      });
      return;
    }

    const fournisseurName = fournisseur.nom_entreprise || fournisseur.nom || 'Fournisseur sans nom';

    try {
      console.log('🚀 Soumission du bon de commande avec génération automatique du numéro...');
      console.log('📦 Articles à inclure:', articlesLignes);
      
      // Préparer les données du bon de commande avec validation
      const bonCommandeData = {
        fournisseur: fournisseurName,
        fournisseur_id: data.fournisseur_id,
        date_commande: data.date_commande,
        date_livraison_prevue: data.date_livraison_prevue || null,
        statut: data.statut,
        statut_paiement: data.statut_paiement,
        remise: Number(data.remise) || 0,
        frais_livraison: Number(data.frais_livraison) || 0,
        frais_logistique: Number(data.frais_logistique) || 0,
        transit_douane: Number(data.transit_douane) || 0,
        taux_tva: Number(data.taux_tva) || 0, // Changed from 20 to 0
        observations: data.observations || '',
        montant_ht: Number(montantHT),
        tva: Number(tva),
        montant_total: Number(montantTTC),
        montant_paye: Number(montantPaye),
        articles: articlesLignes.map(article => ({
          article_id: article.article_id,
          quantite: article.quantite,
          prix_unitaire: Number(article.prix_unitaire),
          montant_ligne: Number(article.montant_ligne)
        }))
      };

      console.log('📊 Données finales à envoyer:', bonCommandeData);
      
      await createBonCommande.mutateAsync(bonCommandeData);
      
      console.log('✅ Bon de commande créé avec succès');
      
      // Réinitialiser le formulaire avec TVA à 0
      form.reset({
        date_commande: new Date().toISOString().split('T')[0],
        statut: 'en_cours',
        statut_paiement: 'en_attente',
        remise: 0,
        frais_livraison: 0,
        frais_logistique: 0,
        transit_douane: 0,
        taux_tva: 0, // Changed from 20 to 0
      });
      setArticlesLignes([]);
      setMontantPaye(0);
      
      onSuccess();
    } catch (error) {
      console.error('❌ Erreur lors de la création du bon de commande:', error);
      toast({
        title: "Erreur de création",
        description: error instanceof Error ? error.message : "Erreur lors de la création du bon de commande. Vérifiez vos données et réessayez.",
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
    createBonCommande,
    setMontantPaye,
    handleRefreshFournisseurs,
    ajouterArticle,
    modifierQuantite,
    modifierPrix,
    supprimerArticle,
    onSubmit
  };
};
