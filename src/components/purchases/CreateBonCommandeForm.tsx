
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useFournisseurs } from '@/hooks/useFournisseurs';
import { useCatalogue } from '@/hooks/useCatalogue';
import { useBonsCommande } from '@/hooks/usePurchases';
import { ArticleSelector } from './ArticleSelector';
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
  observations: z.string().optional(),
});

type BonCommandeForm = z.infer<typeof bonCommandeSchema>;

interface CreateBonCommandeFormProps {
  onSuccess: () => void;
}

interface ArticleLigne {
  article_id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  montant_ligne: number;
}

export const CreateBonCommandeForm = ({ onSuccess }: CreateBonCommandeFormProps) => {
  const { fournisseurs, isLoading: loadingFournisseurs } = useFournisseurs();
  const { articles, isLoading: loadingArticles } = useCatalogue();
  const { createBonCommande } = useBonsCommande();
  
  const [articlesLignes, setArticlesLignes] = useState<ArticleLigne[]>([]);
  const [montantPaye, setMontantPaye] = useState(0);

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
    },
  });

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
  const montantHT = sousTotal - remise + fraisLivraison + fraisLogistique;
  const tva = montantHT * 0.2; // 20% TVA
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

    // Trouver le nom du fournisseur à partir de l'ID
    const fournisseur = fournisseurs?.find(f => f.id === data.fournisseur_id);
    if (!fournisseur) {
      toast({
        title: "Erreur",
        description: "Fournisseur non trouvé",
        variant: "destructive",
      });
      return;
    }

    try {
      await createBonCommande.mutateAsync({
        numero_bon: data.numero_bon,
        fournisseur: fournisseur.nom,
        fournisseur_id: data.fournisseur_id,
        date_commande: data.date_commande,
        date_livraison_prevue: data.date_livraison_prevue,
        statut: data.statut,
        statut_paiement: data.statut_paiement,
        remise: data.remise,
        frais_livraison: data.frais_livraison,
        frais_logistique: data.frais_logistique,
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="numero_bon">Numéro du bon</Label>
              <Input
                id="numero_bon"
                {...form.register('numero_bon')}
                placeholder="BC-XXXX"
              />
            </div>

            <div>
              <Label htmlFor="fournisseur_id">Fournisseur</Label>
              <Select onValueChange={(value) => form.setValue('fournisseur_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {fournisseurs?.map((fournisseur) => (
                    <SelectItem key={fournisseur.id} value={fournisseur.id}>
                      {fournisseur.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date_commande">Date de commande</Label>
              <Input
                id="date_commande"
                type="date"
                {...form.register('date_commande')}
              />
            </div>

            <div>
              <Label htmlFor="date_livraison_prevue">Date de livraison prévue</Label>
              <Input
                id="date_livraison_prevue"
                type="date"
                {...form.register('date_livraison_prevue')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Statuts */}
        <Card>
          <CardHeader>
            <CardTitle>Statuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="statut_paiement">Statut de paiement</Label>
              <Select onValueChange={(value) => form.setValue('statut_paiement', value)} defaultValue="en_attente">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="partiel">Partiel</SelectItem>
                  <SelectItem value="paye">Payé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="statut">Statut de la commande</Label>
              <Select onValueChange={(value) => form.setValue('statut', value)} defaultValue="en_cours">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="valide">Validé</SelectItem>
                  <SelectItem value="livre">Livré</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="montant_paye">Montant payé (€)</Label>
              <Input
                id="montant_paye"
                type="number"
                step="0.01"
                value={montantPaye}
                onChange={(e) => setMontantPaye(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <ArticleSelector
            articles={articles || []}
            onAjouterArticle={ajouterArticle}
            isLoading={loadingArticles}
          />
          
          {articlesLignes.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-6 gap-2 font-medium text-sm">
                <div>Produit</div>
                <div>Quantité</div>
                <div>Prix unitaire (€)</div>
                <div>Montant (€)</div>
                <div></div>
              </div>
              {articlesLignes.map((article, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-center">
                  <div className="text-sm">{article.nom}</div>
                  <Input
                    type="number"
                    min="1"
                    value={article.quantite}
                    onChange={(e) => modifierQuantite(index, parseInt(e.target.value) || 1)}
                    className="h-8"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={article.prix_unitaire}
                    onChange={(e) => modifierPrix(index, parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                  <div className="text-sm font-medium">{article.montant_ligne.toFixed(2)}</div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => supprimerArticle(index)}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Frais et remises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="remise">Remise (€)</Label>
              <Input
                id="remise"
                type="number"
                step="0.01"
                {...form.register('remise', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="frais_livraison">Frais de livraison (€)</Label>
              <Input
                id="frais_livraison"
                type="number"
                step="0.01"
                {...form.register('frais_livraison', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="frais_logistique">Frais de logistique (€)</Label>
              <Input
                id="frais_logistique"
                type="number"
                step="0.01"
                {...form.register('frais_logistique', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Sous-total:</span>
              <span>{sousTotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Remise:</span>
              <span>-{remise.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison:</span>
              <span>{fraisLivraison.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Logistique:</span>
              <span>{fraisLogistique.toFixed(2)} €</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Montant HT:</span>
              <span>{montantHT.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>TVA (20%):</span>
              <span>{tva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total TTC:</span>
              <span>{montantTTC.toFixed(2)} €</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Montant payé:</span>
              <span>{montantPaye.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-bold text-red-600">
              <span>Reste à payer:</span>
              <span>{resteAPayer.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...form.register('observations')}
            placeholder="Notes et observations..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
        <Button type="submit" disabled={createBonCommande.isPending}>
          {createBonCommande.isPending ? 'Création...' : 'Créer le bon de commande'}
        </Button>
      </div>
    </form>
  );
};
