
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useFacturesImpayeesQuery } from '@/hooks/sales/queries/useFacturesImpayeesQuery';
import FacturesImpayeesTable from './FacturesImpayeesTable';

const FacturesImpayees = () => {
  const { data: factures, isLoading } = useFacturesImpayeesQuery();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFactures = factures?.filter(facture => 
    facture.numero_facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facture.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-red-600">Factures Impayées</CardTitle>
            <p className="text-sm text-muted-foreground">
              Factures en attente de paiement ou partiellement payées
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
          </div>
        </CardHeader>
        <CardContent>
          <FacturesImpayeesTable 
            factures={filteredFactures || []} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FacturesImpayees;
