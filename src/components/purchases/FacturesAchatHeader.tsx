
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const FacturesAchatHeader = () => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <div>
        <CardTitle className="text-xl font-bold">Factures d'achat</CardTitle>
        <p className="text-sm text-muted-foreground">Gérez vos factures d'achat fournisseurs</p>
      </div>
      <Button className="bg-blue-600 hover:bg-blue-700">
        <Plus className="mr-2 h-4 w-4" />
        Nouvelle facture
      </Button>
    </CardHeader>
  );
};

export default FacturesAchatHeader;
