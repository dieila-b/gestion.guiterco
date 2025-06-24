
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PrecommandesTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="font-semibold">N° Précommande</TableHead>
        <TableHead className="font-semibold">Client</TableHead>
        <TableHead className="font-semibold">Produit</TableHead>
        <TableHead className="font-semibold text-center">Qté</TableHead>
        <TableHead className="font-semibold">Paiement</TableHead>
        <TableHead className="font-semibold">Disponibilité</TableHead>
        <TableHead className="font-semibold">Statut</TableHead>
        <TableHead className="font-semibold">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default PrecommandesTableHeader;
