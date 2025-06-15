
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useFacturesVenteQuery } from '@/hooks/useSales';
import FacturesVenteTable from './FacturesVenteTable';

const FacturesVente = ({ onSwitchTab }: { onSwitchTab?: (tab: string) => void }) => {
  const { data: factures, isLoading } = useFacturesVenteQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date_facture' | 'numero_facture' | 'client' | 'montant' | 'paiement' | 'livraison'>('date_facture');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filtrage + tri
  const filteredFactures = (factures || [])
    .filter(facture =>
      facture.numero_facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (facture.client?.nom && facture.client.nom.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      // Définir la clé de tri en fonction de la colonne sélectionnée
      let aValue: any = a, bValue: any = b;
      switch (sortBy) {
        case 'date_facture':
          aValue = new Date(a.date_facture);
          bValue = new Date(b.date_facture);
          break;
        case 'numero_facture':
          aValue = a.numero_facture;
          bValue = b.numero_facture;
          break;
        case 'client':
          aValue = a.client?.nom || '';
          bValue = b.client?.nom || '';
          break;
        case 'montant':
          aValue = a.montant_ttc;
          bValue = b.montant_ttc;
          break;
        case 'paiement':
          aValue = a.statut_paiement;
          bValue = b.statut_paiement;
          break;
        case 'livraison':
          aValue = a.statut_livraison || '';
          bValue = b.statut_livraison || '';
          break;
        default:
          aValue = a.date_facture;
          bValue = b.date_facture;
      }
      if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  // Callback pour la création rapide
  const handleNouvelleFacture = () => {
    if (onSwitchTab) onSwitchTab('vente-comptoir');
  };

  // Gestion du tri dynamique à transmettre à la table
  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">Factures de vente</CardTitle>
            <p className="text-sm text-muted-foreground">Gérez vos factures de vente clients</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <Button type="button" size="icon" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              type="button"
              onClick={handleNouvelleFacture}
              data-testid="btn-nouvelle-facture"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle facture
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FacturesVenteTable
            factures={filteredFactures}
            isLoading={isLoading}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FacturesVente;
