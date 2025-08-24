
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import { useFacturesImpayeesQuery } from '@/hooks/useSales';
import FacturesVenteTable from './FacturesVenteTable';

interface FacturesImpayeesProps {
  onNavigateToVenteComptoir?: () => void;
}

const FacturesImpayees: React.FC<FacturesImpayeesProps> = ({ onNavigateToVenteComptoir }) => {
  const { data: factures, isLoading, error } = useFacturesImpayeesQuery();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFactures = factures?.filter(facture => 
    facture.numero_facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (facture.client?.nom && facture.client.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalImpaye = factures?.reduce((sum, facture) => sum + (facture.montant_restant_calcule || 0), 0) || 0;

  if (error) {
    console.error('Erreur chargement factures impayées:', error);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Erreur lors du chargement des factures impayées</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">Factures Impayées</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gérez les factures en attente de paiement
              {totalImpaye > 0 && (
                <span className="block text-destructive font-medium mt-1">
                  Total impayé: {totalImpaye.toFixed(2)} €
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <Button type="submit" size="icon" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={onNavigateToVenteComptoir}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Vente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FacturesVenteTable 
            factures={filteredFactures || []} 
            isLoading={isLoading}
            showOnlyUnpaid={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FacturesImpayees;
