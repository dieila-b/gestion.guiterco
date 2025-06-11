
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFournisseurs } from '@/hooks/useFournisseurs';
import { useCatalogue } from '@/hooks/useCatalogue';
import { useBonsCommande } from '@/hooks/usePurchases';
import { toast } from '@/hooks/use-toast';

const bonCommandeSchema = z.object({
  numero_bon: z.string().min(1, 'Le numéro est requis'),
  fournisseur_id: z.string().min(1, 'Le fournisseur est requis'),
  date_commande: z.string().min(1, 'La date est requise'),
  date_livraison_prevue: z.string().optional(),
  statut: z.string().default('en_cours'),
  statut_paiement: z.string().default('en_attente'),
  remise: z.number().min(0).default(0),
  frais_livraison: z.number().min(0).default(0),
  frais_logistique: z.number().min(0).default(0),
  transit_douane: z.number().min(0).default(0),
  taux_tva: z.number().min(0).max(100).default(20),
  observations: z.string().optional(),
});

type BonCommandeForm = z.infer<typeof bonCommandeSchema>;

interface ArticleLigne {
  article_id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  montant_ligne: number;
}

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

  const ajouterArticle = (article: { id: string; nom: string; prix_unitaire?: number }) => {
    const nouvelleArticle: ArticleLigne = {
      article_id: article.id,
      nom: article.nom,
      quantite: 1,
      prix_unitaire: article.prix_unitaire || 0,
      montant_ligne: article.prix_unitaire || 0,
    };
    setArticlesLignes([...articlesLignes, nouvelleArticle]);
  };

  const modifierQuantite = (index: number, quantite: number) => {
    const nouveauxArticles = [...articlesLignes];
    nouveauxArticles[index].quantite = quantite;
    nouveauxArticles[index].montant_ligne = quantite * nouveauxArticles[index].prix_unitaire;
    setArticlesLignes(nouveauxArticles);
  };

  const modifierPrix = (index: number, prix: number) => {
    const nouveauxArticles = [...articlesLignes];
    nouveauxArticles[index].prix_unitaire = prix;
    nouveauxArticles[index].montant_ligne = prix * nouveauxArticles[index].quantite;
    setArticlesLignes(nouveauxArticles);
  };

  const supprimerArticle = (index: number) => {
    setArticlesLignes(articlesLignes.filter((_, i) => i !== index));
  };

  // Calculs
  const sousTotal = articlesLignes.reduce((sum, article) => sum + article.montant_ligne, 0);
  const remise = form.watch('remise') || 0;
  const fraisLivraison = form.watch('frais_livraison') || 0;
  const fraisLogistique = form.watch('frais_logistique') || 0;
  const transitDouane = form.watch('transit_douane') || 0;
  const tauxTva = form.watch('taux_tva') || 20;
  const montantHT = sousTotal - remise + fraisLivraison + fraisLogistique + transitDouane;
  const tva = montantHT * (tauxTva / 100);
  const montantTTC = montantHT + tva;
  const resteAPayer = montantTTC - montantPaye;

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
        remise: data.remise,
        frais_livraison: data.frais_livraison,
        frais_logistique: data.frais_logistique,
        transit_douane: data.transit_douane,
        taux_tva: data.taux_tva,
        observations: data.observations,
        montant_ht: montantHT,
        tva: tva,
        montant_total: montantTTC,
        montant_paye: montantPaye,
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
