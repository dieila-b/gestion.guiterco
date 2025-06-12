
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFournisseurs } from '@/hooks/useFournisseurs';
import { useCatalogue } from '@/hooks/useCatalogue';
import { useBonsCommande } from '@/hooks/usePurchases';
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
      numero_bon: `BC-${Date.now()}`,
      date_commande: new Date().toISOString().split('T')[0],
      statut: 'en_cours',
      statut_paiement: 'en_attente',
      remise: 0,
      frais_livraison: 0,
      frais_logistique: 0,
      transit_douane: 0,
      taux_tva: 20,
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

  // Calculs avec arrondissements
  const sousTotal = calculateSousTotal(articlesLignes);
  const remise = Math.round(form.watch('remise') || 0);
  const fraisLivraison = Math.round(form.watch('frais_livraison') || 0);
  const fraisLogistique = Math.round(form.watch('frais_logistique') || 0);
  const transitDouane = Math.round(form.watch('transit_douane') || 0);
  const tauxTva = form.watch('taux_tva') || 20;
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
    if (articlesLignes.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un article",
        variant: "destructive",
      });
      return;
    }

    const fournisseur = fournisseurs?.find(f => f.id === data.fournisseur_id);
    if (!fournisseur) {
      toast({
        title: "Erreur",
        description: "Fournisseur non trouvé",
        variant: "destructive",
      });
      return;
    }

    const fournisseurName = fournisseur.nom_entreprise || fournisseur.nom || 'Fournisseur sans nom';

    try {
      await createBonCommande.mutateAsync({
        numero_bon: data.numero_bon,
        fournisseur: fournisseurName,
        fournisseur_id: data.fournisseur_id,
        date_commande: data.date_commande,
        date_livraison_prevue: data.date_livraison_prevue,
        statut: data.statut,
        statut_paiement: data.statut_paiement,
        remise: Math.round(data.remise),
        frais_livraison: Math.round(data.frais_livraison),
        frais_logistique: Math.round(data.frais_logistique),
        transit_douane: Math.round(data.transit_douane),
        taux_tva: data.taux_tva,
        observations: data.observations,
        montant_ht: montantHT,
        tva: tva,
        montant_total: montantTTC,
        montant_paye: Math.round(montantPaye),
      });
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création du bon de commande:', error);
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
