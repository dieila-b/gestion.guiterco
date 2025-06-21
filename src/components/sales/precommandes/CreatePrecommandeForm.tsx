
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useCreatePrecommande } from '@/hooks/precommandes/usePrecommandeMutations';
import { useCatalogue } from '@/hooks/useCatalogue';
import { useClientsQuery } from '@/hooks/sales/queries/useClientsQuery';
import { formatCurrency } from '@/lib/currency';

interface LignePrecommande {
  article_id: string;
  quantite: number;
  prix_unitaire: number;
}

interface CreatePrecommandeFormProps {
  onSuccess: () => void;
}

const CreatePrecommandeForm = ({ onSuccess }: CreatePrecommandeFormProps) => {
  const [formData, setFormData] = useState({
    client_id: '',
    date_livraison_prevue: '',
    observations: '',
    acompte_verse: 0
  });
  const [lignes, setLignes] = useState<LignePrecommande[]>([
    { article_id: '', quantite: 1, prix_unitaire: 0 }
  ]);

  const createPrecommande = useCreatePrecommande();
  const { articles } = useCatalogue();
  const { data: clients } = useClientsQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || lignes.some(l => !l.article_id || l.quantite <= 0)) {
      return;
    }

    const numero_precommande = `PRECO-${Date.now()}`;
    
    await createPrecommande.mutateAsync({
      numero_precommande,
      client_id: formData.client_id,
      date_precommande: new Date().toISOString(),
      date_livraison_prevue: formData.date_livraison_prevue || undefined,
      observations: formData.observations || undefined,
      acompte_verse: formData.acompte_verse || 0,
      lignes: lignes.filter(l => l.article_id && l.quantite > 0)
    });

    onSuccess();
  };

  const ajouterLigne = () => {
    setLignes([...lignes, { article_id: '', quantite: 1, prix_unitaire: 0 }]);
  };

  const supprimerLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const updateLigne = (index: number, field: keyof LignePrecommande, value: any) => {
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    
    // Si c'est un article, mettre à jour le prix automatiquement
    if (field === 'article_id') {
      const article = articles?.find(a => a.id === value);
      if (article?.prix_vente) {
        newLignes[index].prix_unitaire = article.prix_vente;
      }
    }
    
    setLignes(newLignes);
  };

  const montantTotal = lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client">Client *</Label>
          <Select value={formData.client_id} onValueChange={(value) => setFormData({...formData, client_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {clients?.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date_livraison">Date de livraison souhaitée</Label>
          <Input
            type="date"
            value={formData.date_livraison_prevue}
            onChange={(e) => setFormData({...formData, date_livraison_prevue: e.target.value})}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Articles à précommander</CardTitle>
          <Button type="button" onClick={ajouterLigne} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {lignes.map((ligne, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 items-end">
              <div>
                <Label>Article</Label>
                <Select value={ligne.article_id} onValueChange={(value) => updateLigne(index, 'article_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {articles?.map(article => (
                      <SelectItem key={article.id} value={article.id}>
                        {article.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Quantité</Label>
                <Input
                  type="number"
                  min="1"
                  value={ligne.quantite}
                  onChange={(e) => updateLigne(index, 'quantite', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label>Prix unitaire (GNF)</Label>
                <Input
                  type="number"
                  min="0"
                  value={ligne.prix_unitaire}
                  onChange={(e) => updateLigne(index, 'prix_unitaire', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label>Montant</Label>
                <Input
                  value={formatCurrency(ligne.quantite * ligne.prix_unitaire)}
                  disabled
                />
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => supprimerLigne(index)}
                disabled={lignes.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="acompte">Acompte versé (GNF)</Label>
          <Input
            type="number"
            min="0"
            value={formData.acompte_verse}
            onChange={(e) => setFormData({...formData, acompte_verse: parseInt(e.target.value) || 0})}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(montantTotal)}</span>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="observations">Observations</Label>
        <Textarea
          value={formData.observations}
          onChange={(e) => setFormData({...formData, observations: e.target.value})}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={createPrecommande.isPending}>
          {createPrecommande.isPending ? 'Création...' : 'Créer la précommande'}
        </Button>
      </div>
    </form>
  );
};

export default CreatePrecommandeForm;
