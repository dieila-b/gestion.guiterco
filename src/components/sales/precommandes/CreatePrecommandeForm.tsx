
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Search } from 'lucide-react';
import { useCatalogue } from '@/hooks/useCatalogue';
import { useClientsQuery } from '@/hooks/sales/queries/useClientsQuery';
import { useStockDisponibilite } from '@/hooks/precommandes/useStockDisponibilite';
import { useCreatePrecommande } from '@/hooks/precommandes/useCreatePrecommande';
import { formatCurrency } from '@/lib/currency';
import { toast } from '@/hooks/use-toast';

interface LignePrecommande {
  article_id: string;
  article_nom: string;
  article_reference: string;
  quantite: number;
  prix_unitaire: number;
  montant_ligne: number;
}

interface CreatePrecommandeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreatePrecommandeForm = ({ onSuccess, onCancel }: CreatePrecommandeFormProps) => {
  const [clientId, setClientId] = useState('');
  const [dateLivraisonPrevue, setDateLivraisonPrevue] = useState('');
  const [observations, setObservations] = useState('');
  const [lignes, setLignes] = useState<LignePrecommande[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { articles } = useCatalogue();
  const { data: clients } = useClientsQuery();
  const createPrecommande = useCreatePrecommande();

  const filteredArticles = articles?.filter(article =>
    article.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ajouterArticle = (article: any) => {
    const ligneExistante = lignes.find(l => l.article_id === article.id);
    if (ligneExistante) {
      setLignes(lignes.map(l => 
        l.article_id === article.id 
          ? { ...l, quantite: l.quantite + 1, montant_ligne: (l.quantite + 1) * l.prix_unitaire }
          : l
      ));
    } else {
      const nouvelleLigne: LignePrecommande = {
        article_id: article.id,
        article_nom: article.nom,
        article_reference: article.reference,
        quantite: 1,
        prix_unitaire: article.prix_vente || 0,
        montant_ligne: article.prix_vente || 0
      };
      setLignes([...lignes, nouvelleLigne]);
    }
    setSearchTerm('');
  };

  const modifierQuantite = (articleId: string, nouvelleQuantite: number) => {
    if (nouvelleQuantite <= 0) {
      supprimerLigne(articleId);
      return;
    }
    setLignes(lignes.map(l => 
      l.article_id === articleId 
        ? { ...l, quantite: nouvelleQuantite, montant_ligne: nouvelleQuantite * l.prix_unitaire }
        : l
    ));
  };

  const supprimerLigne = (articleId: string) => {
    setLignes(lignes.filter(l => l.article_id !== articleId));
  };

  const calculerTotaux = () => {
    const montantHT = lignes.reduce((sum, ligne) => sum + ligne.montant_ligne, 0);
    const tva = montantHT * 0.2;
    const montantTTC = montantHT + tva;
    return { montantHT, tva, montantTTC };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || lignes.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client et ajouter au moins un article",
        variant: "destructive"
      });
      return;
    }

    const { montantHT, tva, montantTTC } = calculerTotaux();
    
    try {
      await createPrecommande.mutateAsync({
        client_id: clientId,
        date_livraison_prevue: dateLivraisonPrevue || undefined,
        observations,
        montant_ht: montantHT,
        tva,
        montant_ttc: montantTTC,
        lignes: lignes.map(ligne => ({
          article_id: ligne.article_id,
          quantite: ligne.quantite,
          prix_unitaire: ligne.prix_unitaire,
          montant_ligne: ligne.montant_ligne
        }))
      });

      onSuccess();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const { montantHT, tva, montantTTC } = calculerTotaux();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle>Informations client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="client">Client *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.nom} {client.email && `(${client.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date-livraison">Date de livraison prévue</Label>
            <Input
              id="date-livraison"
              type="date"
              value={dateLivraisonPrevue}
              onChange={(e) => setDateLivraisonPrevue(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Articles à précommander</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recherche d'articles */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && filteredArticles && filteredArticles.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredArticles.slice(0, 10).map(article => (
                  <ArticleSearchItem
                    key={article.id}
                    article={article}
                    onSelect={() => ajouterArticle(article)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Liste des articles ajoutés */}
          {lignes.length > 0 && (
            <div className="space-y-2">
              {lignes.map(ligne => (
                <LignePrecommandeItem
                  key={ligne.article_id}
                  ligne={ligne}
                  onQuantiteChange={(nouvelleQuantite) => modifierQuantite(ligne.article_id, nouvelleQuantite)}
                  onSupprimer={() => supprimerLigne(ligne.article_id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Observations */}
      <Card>
        <CardHeader>
          <CardTitle>Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Commentaires ou instructions spéciales..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Totaux */}
      {lignes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Montant HT :</span>
              <span>{formatCurrency(montantHT)}</span>
            </div>
            <div className="flex justify-between">
              <span>TVA (20%) :</span>
              <span>{formatCurrency(tva)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total TTC :</span>
              <span>{formatCurrency(montantTTC)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={createPrecommande.isPending || !clientId || lignes.length === 0}>
          {createPrecommande.isPending ? "Création..." : "Créer la précommande"}
        </Button>
      </div>
    </form>
  );
};

const ArticleSearchItem = ({ article, onSelect }: { article: any; onSelect: () => void }) => {
  const { data: stock } = useStockDisponibilite(article.id);
  
  return (
    <div
      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{article.nom}</p>
          <p className="text-sm text-muted-foreground">Ref: {article.reference}</p>
          <p className="text-sm font-medium">{formatCurrency(article.prix_vente || 0)}</p>
        </div>
        <div className="text-right">
          <Badge variant={stock?.total === 0 ? "destructive" : "outline"}>
            Stock: {stock?.total || 0}
          </Badge>
          {stock?.total === 0 && (
            <p className="text-xs text-red-600 mt-1">Rupture de stock</p>
          )}
        </div>
      </div>
    </div>
  );
};

const LignePrecommandeItem = ({ 
  ligne, 
  onQuantiteChange, 
  onSupprimer 
}: { 
  ligne: LignePrecommande; 
  onQuantiteChange: (quantite: number) => void;
  onSupprimer: () => void;
}) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <p className="font-medium">{ligne.article_nom}</p>
        <p className="text-sm text-muted-foreground">Ref: {ligne.article_reference}</p>
        <p className="text-sm">{formatCurrency(ligne.prix_unitaire)} / unité</p>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onQuantiteChange(ligne.quantite - 1)}
          >
            -
          </Button>
          <Input
            type="number"
            value={ligne.quantite}
            onChange={(e) => onQuantiteChange(parseInt(e.target.value) || 0)}
            className="w-16 text-center"
            min="1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onQuantiteChange(ligne.quantite + 1)}
          >
            +
          </Button>
        </div>
        <div className="text-right min-w-24">
          <p className="font-medium">{formatCurrency(ligne.montant_ligne)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSupprimer}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CreatePrecommandeForm;

