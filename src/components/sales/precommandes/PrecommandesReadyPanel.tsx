
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { usePrecommandesPretes } from '@/hooks/precommandes/usePrecommandesPretes';
import { useConvertPrecommandesEnLot } from '@/hooks/precommandes/useConvertPrecommandesEnLot';
import { formatCurrency } from '@/lib/currency';

const PrecommandesReadyPanel = () => {
  const { data: precommandesPretes, isLoading } = usePrecommandesPretes();
  const convertEnLot = useConvertPrecommandesEnLot();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(precommandesPretes?.map(p => p.id) || []);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(pid => pid !== id));
    }
  };

  const handleConvertSelected = () => {
    if (selectedIds.length === 0) return;
    convertEnLot.mutate(selectedIds);
    setSelectedIds([]);
  };

  const getStatutBadge = (statut: string, nbLignes: number, nbLignesLivrees: number) => {
    if (nbLignes === nbLignesLivrees) {
      return <Badge className="bg-green-100 text-green-800">Complètement livrée</Badge>;
    }
    if (nbLignesLivrees > 0) {
      return <Badge className="bg-orange-100 text-orange-800">Partiellement livrée</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">Prête</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Précommandes prêtes à convertir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (!precommandesPretes || precommandesPretes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Précommandes prêtes à convertir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Aucune précommande prête à être convertie pour le moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Précommandes prêtes à convertir
          <Badge variant="secondary">{precommandesPretes.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Actions en lot */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedIds.length === precommandesPretes.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedIds.length > 0 ? `${selectedIds.length} sélectionnée(s)` : 'Tout sélectionner'}
              </span>
            </div>
            <Button
              onClick={handleConvertSelected}
              disabled={selectedIds.length === 0 || convertEnLot.isPending}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              {convertEnLot.isPending ? 'Conversion...' : 'Convertir en ventes'}
            </Button>
          </div>

          {/* Tableau des précommandes */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="width-[50px]"></TableHead>
                  <TableHead>N° Précommande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Lignes</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Acompte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {precommandesPretes.map((precommande) => (
                  <TableRow key={precommande.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(precommande.id)}
                        onCheckedChange={(checked) => handleSelectOne(precommande.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {precommande.numero_precommande}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{precommande.client_nom}</div>
                        {precommande.client_email && (
                          <div className="text-sm text-gray-500">{precommande.client_email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(precommande.date_precommande).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {getStatutBadge(precommande.statut, precommande.nb_lignes, precommande.nb_lignes_livrees)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-green-600 font-medium">{precommande.nb_lignes_livrees}</span>
                        <span className="text-gray-400">/</span>
                        <span>{precommande.nb_lignes}</span>
                        {precommande.nb_lignes_livrees === precommande.nb_lignes && (
                          <CheckCircle className="h-4 w-4 text-green-600 ml-1" />
                        )}
                        {precommande.nb_lignes_livrees > 0 && precommande.nb_lignes_livrees < precommande.nb_lignes && (
                          <AlertCircle className="h-4 w-4 text-orange-600 ml-1" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(precommande.montant_ttc)}
                    </TableCell>
                    <TableCell className="text-right">
                      {precommande.acompte_verse ? formatCurrency(precommande.acompte_verse) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Résumé */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total précommandes</div>
                <div className="font-semibold">{precommandesPretes.length}</div>
              </div>
              <div>
                <div className="text-gray-600">Complètement livrées</div>
                <div className="font-semibold text-green-600">
                  {precommandesPretes.filter(p => p.nb_lignes === p.nb_lignes_livrees).length}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Partiellement livrées</div>
                <div className="font-semibold text-orange-600">
                  {precommandesPretes.filter(p => p.nb_lignes_livrees > 0 && p.nb_lignes_livrees < p.nb_lignes).length}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Valeur totale</div>
                <div className="font-semibold">
                  {formatCurrency(precommandesPretes.reduce((sum, p) => sum + p.montant_ttc, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrecommandesReadyPanel;
