
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useCatalogue } from '@/hooks/useCatalogue';
import { useStockDisponibilite } from '@/hooks/precommandes/useStockDisponibilite';
import { useUpdateLignesPrecommande } from '@/hooks/precommandes/useUpdateLignesPrecommande';
import { formatCurrency } from '@/lib/currency';
import type { PrecommandeComplete, LignePrecommandeComplete } from '@/types/precommandes';

interface EditLignesPrecommandeDialogProps {
  precommande: PrecommandeComplete | null;
  open: boolean;
  onClose: () => void;
}

interface LigneEdition {
  id?: string;
  article_id: string;
  quantite: number;
  quantite_livree: number;
  prix_unitaire: number;
  statut_ligne: string;
  isNew?: boolean;
}

const EditLignesPrecommandeDialog = ({ precommande, open, onClose }: EditLignesPrecommandeDialogProps) => {
  const { articles: catalogue } = useCatalogue();
  const updateLignes = useUpdateLignesPrecommande();
  const [lignes, setLignes] = useState<LigneEdition[]>([]);
  const [nouvelleArticle, setNouvelleArticle] = useState('');

  useEffect(() => {
    if (precommande && precommande.lignes_precommande) {
      setLignes(precommande.lignes_precommande.map(ligne => ({
        id: ligne.id,
        article_id: ligne.article_id,
        quantite: ligne.quantite,
        quantite_livree: ligne.quantite_livree || 0,
        prix_unitaire: ligne.prix_unitaire,
        statut_ligne: ligne.statut_ligne || 'en_attente'
      })));
    }
  }, [precommande]);

  const handleAddArticle = () => {
    if (!nouvelleArticle) return;
    
    const article = catalogue?.find(a => a.id === nouvelleArticle);
    if (!article) return;

    const nouvelleLigne: LigneEdition = {
      article_id: nouvelleArticle,
      quantite: 1,
      quantite_livree: 0,
      prix_unitaire: article.prix_vente || 0,
      statut_ligne: 'en_attente',
      isNew: true
    };

    setLignes([...lignes, nouvelleLigne]);
    setNouvelleArticle('');
  };

  const handleUpdateLigne = (index: number, field: keyof LigneEdition, value: any) => {
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    
    // Mettre à jour le statut selon la livraison
    if (field === 'quantite_livree') {
      const ligne = newLignes[index];
      if (ligne.quantite_livree === 0) {
        ligne.statut_ligne = 'en_attente';
      } else if (ligne.quantite_livree < ligne.quantite) {
        ligne.statut_ligne = 'partiellement_livree';
      } else if (ligne.quantite_livree >= ligne.quantite) {
        ligne.statut_ligne = 'livree';
      }
    }
    
    setLignes(newLignes);
  };

  const handleDeleteLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!precommande) return;

    try {
      await updateLignes.mutateAsync({
        precommande_id: precommande.id,
        lignes: lignes.map(ligne => ({
          id: ligne.id,
          article_id: ligne.article_id,
          quantite: ligne.quantite,
          quantite_livree: ligne.quantite_livree,
          prix_unitaire: ligne.prix_unitaire,
          statut_ligne: ligne.statut_ligne,
          montant_ligne: ligne.quantite * ligne.prix_unitaire
        }))
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'livree':
        return <Badge className="bg-green-100 text-green-800">Livrée</Badge>;
      case 'partiellement_livree':
        return <Badge className="bg-orange-100 text-orange-800">Partiellement livrée</Badge>;
      case 'en_attente':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const getArticleName = (articleId: string) => {
    return catalogue?.find(a => a.id === articleId)?.nom || 'Article inconnu';
  };

  const articlesDisponibles = catalogue?.filter(article => 
    !lignes.some(ligne => ligne.article_id === article.id)
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Éditer les articles - {precommande?.numero_precommande}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ajouter un nouvel article */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">Ajouter un article</h3>
            <div className="flex gap-3">
              <Select value={nouvelleArticle} onValueChange={setNouvelleArticle}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sélectionner un article" />
                </SelectTrigger>
                <SelectContent>
                  {articlesDisponibles.map(article => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.nom} - {formatCurrency(article.prix_vente || 0)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddArticle} disabled={!nouvelleArticle}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          {/* Liste des articles */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Quantité livrée</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lignes.map((ligne, index) => (
                  <TableRow key={ligne.id || index}>
                    <TableCell>
                      <div className="font-medium">
                        {getArticleName(ligne.article_id)}
                        {ligne.isNew && <Badge className="ml-2 bg-blue-100 text-blue-800">Nouveau</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={ligne.quantite}
                        onChange={(e) => handleUpdateLigne(index, 'quantite', parseInt(e.target.value) || 0)}
                        className="w-20"
                        min="1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={ligne.quantite_livree}
                        onChange={(e) => handleUpdateLigne(index, 'quantite_livree', parseInt(e.target.value) || 0)}
                        className="w-20"
                        min="0"
                        max={ligne.quantite}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={ligne.prix_unitaire}
                        onChange={(e) => handleUpdateLigne(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                        className="w-24"
                        step="0.01"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      {getStatutBadge(ligne.statut_ligne)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(ligne.quantite * ligne.prix_unitaire)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLigne(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Résumé */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total de la précommande:</span>
              <span className="font-bold text-lg">
                {formatCurrency(lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0))}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateLignes.isPending}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={updateLignes.isPending}>
            {updateLignes.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLignesPrecommandeDialog;
