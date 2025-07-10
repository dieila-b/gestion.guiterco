
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { useFacturesVenteQuery } from '@/hooks/useSales';
import FacturesVenteTable from './FacturesVenteTable';
import { formatCurrency } from '@/lib/currency';

interface FacturesImpayeesProps {
  onNavigateToVenteComptoir?: () => void;
}

const FacturesImpayees: React.FC<FacturesImpayeesProps> = ({ onNavigateToVenteComptoir }) => {
  const { data: factures, isLoading } = useFacturesVenteQuery();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer uniquement les factures impayées (non payées ou partiellement payées)
  const facturesImpayees = useMemo(() => {
    if (!factures) return [];
    
    return factures.filter(facture => {
      const paidAmount = (facture.versements ?? []).reduce((sum, v) => sum + (v.montant || 0), 0);
      const remainingAmount = (facture.montant_ttc || 0) - paidAmount;
      
      // Ne garder que les factures avec un montant restant > 0
      return remainingAmount > 0;
    });
  }, [factures]);

  // Appliquer le filtre de recherche
  const filteredFactures = useMemo(() => {
    if (!facturesImpayees) return [];
    
    return facturesImpayees.filter(facture => 
      facture.numero_facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (facture.client?.nom && facture.client.nom.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [facturesImpayees, searchTerm]);

  // Calculer le total dû
  const totalDu = useMemo(() => {
    return filteredFactures.reduce((total, facture) => {
      const paidAmount = (facture.versements ?? []).reduce((sum, v) => sum + (v.montant || 0), 0);
      const remainingAmount = (facture.montant_ttc || 0) - paidAmount;
      return total + remainingAmount;
    }, 0);
  }, [filteredFactures]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Factures Impayées
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gérez vos factures en attente de paiement
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
          {/* Indicateur du total dû */}
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-800">
                  Total des montants dus
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-800">
                  {formatCurrency(totalDu)}
                </div>
                <div className="text-sm text-orange-600">
                  {filteredFactures.length} facture{filteredFactures.length > 1 ? 's' : ''} impayée{filteredFactures.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          <FacturesVenteTable 
            factures={filteredFactures || []} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FacturesImpayees;
