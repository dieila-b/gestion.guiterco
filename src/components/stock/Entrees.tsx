
import React, { useState } from 'react';
import { useEntreesStock } from '@/hooks/stock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { AddEntreeDialog } from './entrees/AddEntreeDialog';
import { EntreesSearchBar } from './entrees/EntreesSearchBar';
import { EntreesTable } from './entrees/EntreesTable';

const Entrees = () => {
  const { entrees, isLoading } = useEntreesStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredEntrees = entrees?.filter(entree => 
    entree.article?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entree.article?.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entree.entrepot?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entree.fournisseur?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Entrées de Stock</CardTitle>
        <div className="flex space-x-2">
          <AddEntreeDialog 
            isOpen={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
          />
          <Button variant="outline" size="icon" title="Rafraîchir">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <EntreesSearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <EntreesTable 
          entrees={filteredEntrees}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default Entrees;
