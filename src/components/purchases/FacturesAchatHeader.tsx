
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FacturesAchatHeaderProps {
  onNewFacture?: () => void;
}

export const FacturesAchatHeader = ({ onNewFacture }: FacturesAchatHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Factures d'achat</h2>
      <Button onClick={onNewFacture}>
        <Plus className="mr-2 h-4 w-4" />
        Nouvelle facture
      </Button>
    </div>
  );
};
