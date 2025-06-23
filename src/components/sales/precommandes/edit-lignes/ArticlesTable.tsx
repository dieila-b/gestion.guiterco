
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import type { Article } from '@/hooks/useCatalogue';

interface LigneEdition {
  id?: string;
  article_id: string;
  quantite: number;
  quantite_livree: number;
  prix_unitaire: number;
  statut_ligne: string;
  isNew?: boolean;
}

interface ArticlesTableProps {
  lignes: LigneEdition[];
  catalogue: Article[] | undefined;
  onUpdateLigne: (index: number, field: keyof LigneEdition, value: any) => void;
  onDeleteLigne: (index: number) => void;
}

const ArticlesTable = ({ lignes, catalogue, onUpdateLigne, onDeleteLigne }: ArticlesTableProps) => {
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

  return (
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
                  onChange={(e) => onUpdateLigne(index, 'quantite', parseInt(e.target.value) || 0)}
                  className="w-20"
                  min="1"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={ligne.quantite_livree}
                  onChange={(e) => onUpdateLigne(index, 'quantite_livree', parseInt(e.target.value) || 0)}
                  className="w-20"
                  min="0"
                  max={ligne.quantite}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={ligne.prix_unitaire}
                  onChange={(e) => onUpdateLigne(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
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
                  onClick={() => onDeleteLigne(index)}
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
  );
};

export default ArticlesTable;
