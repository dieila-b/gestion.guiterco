
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useFacturesVenteQuery } from '@/hooks/useSales';
import FacturesVenteTable from './FacturesVenteTable';

const FacturesVente = () => {
  const { data: factures, isLoading } = useFacturesVenteQuery();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFactures = factures?.filter(facture => 
    facture.numero_facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (facture.client?.nom && facture.client.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <Button type="submit" size="icon" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle facture
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FacturesVenteTable 
            factures={filteredFactures || []} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FacturesVente;
